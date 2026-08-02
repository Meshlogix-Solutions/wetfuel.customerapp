import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, Output, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MapboxAddressSelection {
  address:string;
  city:string;
  state:string;
  zipCode:string;
  latitude:number;
  longitude:number;
}

interface AddressSuggestion extends MapboxAddressSelection {
  id:string;
  label:string;
}

@Component({
  selector:'app-mapbox-address-autocomplete',
  standalone:true,
  template:`<div class="field"><label for="site-address">Street address</label><div class="input-wrap"><input id="site-address" type="search" role="combobox" autocomplete="off" aria-autocomplete="list" aria-controls="site-address-results" [attr.aria-expanded]="suggestions.length>0" [value]="value" placeholder="Start typing an address" (input)="onInput($any($event.target).value)" (keydown)="onKeydown($event)">@if(searching){<span>Searching...</span>}</div>
    @if(suggestions.length){<div id="site-address-results" class="results" role="listbox">@for(item of suggestions;track item.id;let index=$index){<button type="button" role="option" [class.active]="index===activeIndex" (click)="select(item)">{{item.label}}</button>}</div>}
    @if(error){<small>{{error}}</small>}</div>`,
  styles:[`.field{position:relative;display:grid;gap:7px}.field label{font-size:13px;font-weight:800}.input-wrap{position:relative}.input-wrap input{width:100%;min-height:52px;border:1px solid var(--wf-border);border-radius:15px;background:var(--wf-surface);color:var(--wf-fg);padding:12px 88px 12px 14px;font:inherit;outline:none}.input-wrap input:focus{border-color:var(--wf-primary);box-shadow:0 0 0 3px var(--wf-primary-soft)}.input-wrap span{position:absolute;right:13px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--wf-muted-fg)}.results{position:absolute;z-index:20;top:79px;left:0;right:0;overflow:hidden;border:1px solid var(--wf-border);border-radius:13px;background:var(--wf-surface);box-shadow:0 10px 30px rgba(0,0,0,.28)}.results button{display:block;width:100%;border:0;border-bottom:1px solid var(--wf-border);background:var(--wf-surface);color:var(--wf-fg);padding:12px 14px;text-align:left;font:inherit}.results button:last-child{border-bottom:0}.results button:hover,.results button.active{background:color-mix(in srgb,var(--wf-primary) 14%,var(--wf-surface))}small{color:#e31b23}`],
})
export class MapboxAddressAutocompleteComponent implements OnDestroy {
  private readonly http=inject(HttpClient);private readonly zone=inject(NgZone);private readonly cdr=inject(ChangeDetectorRef);
  @Input() value='';
  @Output() valueChange=new EventEmitter<string>();
  @Output() locationSelected=new EventEmitter<MapboxAddressSelection>();
  suggestions:AddressSuggestion[]=[];searching=false;error='';activeIndex=-1;
  private timer?:number;private request?:Subscription;private requestId=0;private sessionToken=crypto.randomUUID();

  ngOnDestroy():void{if(this.timer)window.clearTimeout(this.timer);this.request?.unsubscribe();}
  onInput(value:string):void{this.value=value;this.valueChange.emit(value);this.error='';this.suggestions=[];this.activeIndex=-1;this.requestId++;this.request?.unsubscribe();if(this.timer)window.clearTimeout(this.timer);this.searching=false;if(value.trim().length<3)return;this.timer=window.setTimeout(()=>this.search(),175);}
  onKeydown(event:KeyboardEvent):void{if(event.key==='ArrowDown'&&this.suggestions.length){event.preventDefault();this.activeIndex=(this.activeIndex+1)%this.suggestions.length;}else if(event.key==='ArrowUp'&&this.suggestions.length){event.preventDefault();this.activeIndex=(this.activeIndex-1+this.suggestions.length)%this.suggestions.length;}else if(event.key==='Enter'&&this.suggestions.length){event.preventDefault();this.select(this.suggestions[Math.max(0,this.activeIndex)]);}else if(event.key==='Escape'){this.suggestions=[];this.activeIndex=-1;}}
  private search():void{const query=this.value.trim();if(!query)return;const id=++this.requestId;this.searching=true;let params=new HttpParams().set('q',query.slice(0,256)).set('session_token',this.sessionToken).set('access_token',environment.mapboxAccessToken).set('country','US').set('language','en').set('types','address,street,poi').set('limit','5');this.request=this.http.get<any>('https://api.mapbox.com/search/searchbox/v1/suggest',{params}).subscribe({next:response=>{if(id!==this.requestId)return;this.suggestions=(response?.suggestions??[]).map((x:any)=>this.mapSuggestion(x)).filter((x:AddressSuggestion)=>!!x.id);this.activeIndex=this.suggestions.length?0:-1;this.searching=false;this.error=this.suggestions.length?'':'No matching addresses found.';this.refresh();},error:()=>{if(id===this.requestId){this.searching=false;this.error='Address search is unavailable.';this.refresh();}}});}
  select(item:AddressSuggestion):void{const id=++this.requestId;this.request?.unsubscribe();this.value=item.label;this.valueChange.emit(this.value);this.suggestions=[];this.searching=true;this.error='';const params=new HttpParams().set('session_token',this.sessionToken).set('access_token',environment.mapboxAccessToken).set('language','en');this.request=this.http.get<any>(`https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(item.id)}`,{params}).subscribe({next:response=>{if(id!==this.requestId)return;const feature=response?.features?.[0];const properties=feature?.properties??{};const context=properties?.context??{};const longitude=Number(feature?.geometry?.coordinates?.[0]??properties?.coordinates?.longitude);const latitude=Number(feature?.geometry?.coordinates?.[1]??properties?.coordinates?.latitude);const selection:MapboxAddressSelection={address:String(properties?.full_address??item.label??properties?.address??context?.address?.name??properties?.name??item.address).trim(),city:String(context?.place?.name??context?.locality?.name??item.city).trim(),state:String(context?.region?.region_code??item.state).replace(/^US-/,'').trim(),zipCode:String(context?.postcode?.name??item.zipCode).trim(),latitude,longitude};this.searching=false;if(!selection.address||!selection.city||selection.state.length!==2||!selection.zipCode||!Number.isFinite(latitude)||!Number.isFinite(longitude)){this.error='Select a result containing a complete US street address.';}else{this.value=selection.address;this.valueChange.emit(selection.address);this.locationSelected.emit(selection);this.sessionToken=crypto.randomUUID();}this.refresh();},error:()=>{if(id===this.requestId){this.searching=false;this.error='The selected address could not be loaded.';this.refresh();}}});}
  private mapSuggestion(x:any):AddressSuggestion{const context=x?.context??{};return{id:String(x?.mapbox_id??''),label:String(x?.full_address??[x?.name,x?.place_formatted].filter(Boolean).join(', ')),address:String(x?.address??context?.address?.name??x?.name??''),city:String(context?.place?.name??context?.locality?.name??''),state:String(context?.region?.region_code??'').replace(/^US-/,''),zipCode:String(context?.postcode?.name??''),latitude:NaN,longitude:NaN};}
  private refresh():void{this.zone.run(()=>this.cdr.detectChanges());}
}
