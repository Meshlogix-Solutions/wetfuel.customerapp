import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import type { Map as MapboxMap } from 'mapbox-gl/esm';
import { environment } from '../../environments/environment';

export interface CustomerTerritorySelection { geoJson: string; }

@Component({
  selector: 'app-mapbox-territory-editor',
  standalone: true,
  template: `<div class="heading"><strong>Delivery territory</strong><div>Search for a location, then tap around the territory boundary. At least 3 points are required.</div></div>
    <div class="location-search"><div class="search-row"><input type="search" role="combobox" aria-label="Search map location" aria-autocomplete="list" aria-controls="territory-search-results" [attr.aria-expanded]="searchResults.length>0" [attr.aria-activedescendant]="activeSearchIndex>=0?'territory-search-result-'+activeSearchIndex:null" placeholder="Search address, city, or ZIP code" [value]="searchText" (input)="onSearchInput($any($event.target).value)" (keydown)="onSearchKeydown($event)">@if(searching){<span class="searching">Searching...</span>}</div>
      @if(searchError){<div class="search-error">{{searchError}}</div>}
      @if(searchResults.length){<div class="search-results" id="territory-search-results" role="listbox">@for(result of searchResults;track result.id;let index=$index){<button type="button" role="option" [id]="'territory-search-result-'+index" [class.active]="index===activeSearchIndex" [attr.aria-selected]="index===activeSearchIndex" (click)="selectSearchResult(result)">{{result.label}}</button>}</div>}
    </div>
    <div class="map-shell"><div #map class="map"></div><canvas #overlay class="overlay"></canvas>
      <div class="actions"><button type="button" (click)="undo()" [disabled]="!points.length">Undo</button><button type="button" (click)="clear()" [disabled]="!points.length">Clear</button></div>
      @if(error){<div class="message error">{{error}}</div>}<div class="message">{{points.length}} boundary point{{points.length===1?'':'s'}} · Tap the map to add the next point.</div>
    </div>`,
  styles: [`.heading{margin:8px 2px}.heading div{font-size:12px;color:var(--wf-muted-fg);margin-top:3px}.location-search{position:relative;margin:10px 0}.search-row{position:relative;display:flex}.search-row input{min-width:0;width:100%;border:1px solid var(--wf-border);border-radius:12px;background:var(--wf-surface);color:var(--wf-fg);padding:11px 84px 11px 13px;font:inherit}.searching{position:absolute;right:13px;top:50%;transform:translateY(-50%);color:var(--wf-muted-fg);font-size:12px}.search-results{position:absolute;z-index:5;top:48px;left:0;right:0;overflow:hidden;border:1px solid var(--wf-border);border-radius:12px;background:var(--wf-surface);box-shadow:0 8px 24px rgba(0,0,0,.2)}.search-results button{display:block;width:100%;border:0;border-bottom:1px solid var(--wf-border);background:transparent;color:var(--wf-fg);padding:11px 13px;text-align:left}.search-results button:hover,.search-results button.active{background:color-mix(in srgb,var(--wf-primary) 12%,var(--wf-surface))}.search-results button:last-child{border-bottom:0}.search-error{margin:6px 2px 0;color:#e31b23;font-size:12px}.map-shell{position:relative;overflow:hidden;border:1px solid var(--wf-border);border-radius:20px;background:var(--wf-surface)}.map{height:340px;width:100%}.overlay{position:absolute;z-index:1;inset:0;width:100%;height:100%;pointer-events:none}.actions{position:absolute;z-index:2;top:12px;left:12px;display:flex;gap:7px}.actions button{border:1px solid #d4d4d8;border-radius:10px;background:#fff;color:#27272a;padding:9px 13px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.15)}.actions button:disabled{opacity:.5}.message{position:absolute;z-index:2;left:12px;right:12px;bottom:12px;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.92);color:#27272a;font-size:12px;box-shadow:0 3px 14px rgba(0,0,0,.18)}.message.error{top:58px;bottom:auto;background:#fff1f2;color:#9f1239}`],
})
export class CustomerMapboxTerritoryEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly zone=inject(NgZone);
  private readonly changeDetector=inject(ChangeDetectorRef);
  private readonly http=inject(HttpClient);
  @ViewChild('map',{static:true}) mapElement!:ElementRef<HTMLDivElement>;
  @ViewChild('overlay',{static:true}) overlayElement!:ElementRef<HTMLCanvasElement>;
  @Input() territoryGeoJson?:string|null;
  @Output() territoryChanged=new EventEmitter<CustomerTerritorySelection>();
  points:number[][]=[]; error=''; searchText=''; searching=false; searchError=''; searchResults:MapSearchResult[]=[]; activeSearchIndex=-1; private searchTimer?:number; private searchRequestId=0; private searchSubscription?:Subscription; private searchSessionToken=crypto.randomUUID(); private searchSuggestionCount=0; private readonly searchCache=new Map<string,MapSearchResult[]>(); private map?:MapboxMap; private mapbox?:typeof import('mapbox-gl/esm'); private observer?:ResizeObserver; private ready=false; private syncing=false; private syncTimers:number[]=[];

  async ngAfterViewInit():Promise<void>{
    if(!environment.mapboxAccessToken){this.error='Mapbox access token is not configured.';return;}
    this.readInput();
    const mapboxgl=await import('mapbox-gl/esm');this.mapbox=mapboxgl;
    this.map=new mapboxgl.Map({accessToken:environment.mapboxAccessToken,container:this.mapElement.nativeElement,style:rasterStyle(environment.mapboxAccessToken),projection:'mercator',center:this.points.length?[this.points[0][0],this.points[0][1]]:[-98.5795,39.8283],zoom:this.points.length?10:3});
    this.observer=new ResizeObserver(()=>{this.map?.resize();this.draw();});this.observer.observe(this.mapElement.nativeElement);
    this.map.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right');
    this.map.on('click',event=>this.zone.run(()=>{this.points=[...this.points,[event.lngLat.lng,event.lngLat.lat]];this.render(true);}));
    this.map.on('move',()=>this.draw());this.map.on('resize',()=>this.draw());
    this.map.on('load',()=>this.zone.run(()=>{this.ready=true;this.initializeTerritoryLayers();this.render(false);this.scheduleViewportSync();}));
    this.map.on('idle',()=>this.draw());
    this.map.on('error',event=>this.zone.run(()=>{const message=event.error?.message||'Mapbox could not be loaded.';if(!/abort|cancel/i.test(message))this.error=message;}));
  }
  ngOnChanges(changes:SimpleChanges):void{if(changes['territoryGeoJson']&&!this.syncing){this.readInput();if(this.ready){this.render(false);this.scheduleViewportSync();}}}
  ngOnDestroy():void{if(this.searchTimer)window.clearTimeout(this.searchTimer);this.searchSubscription?.unsubscribe();this.syncTimers.forEach(timer=>window.clearTimeout(timer));this.observer?.disconnect();this.map?.remove();}
  undo():void{this.points=this.points.slice(0,-1);this.render(true);}
  clear():void{this.points=[];this.render(true);}
  onSearchInput(value:string):void{
    this.searchText=value;this.searchError='';this.searchResults=[];this.activeSearchIndex=-1;this.searchRequestId++;this.searchSubscription?.unsubscribe();this.searching=false;if(this.searchTimer)window.clearTimeout(this.searchTimer);
    if(value.trim().length<3){this.searching=false;return;}
    const cached=this.searchCache.get(value.trim().toLowerCase());if(cached){this.showSearchResults(cached);return;}
    this.searchTimer=window.setTimeout(()=>this.searchLocation(),175);
  }
  onSearchKeydown(event:KeyboardEvent):void{
    if(event.key==='ArrowDown'&&this.searchResults.length){event.preventDefault();this.activeSearchIndex=(this.activeSearchIndex+1)%this.searchResults.length;}
    else if(event.key==='ArrowUp'&&this.searchResults.length){event.preventDefault();this.activeSearchIndex=(this.activeSearchIndex-1+this.searchResults.length)%this.searchResults.length;}
    else if(event.key==='Enter'){event.preventDefault();const result=this.searchResults[this.activeSearchIndex];if(result)this.selectSearchResult(result);else this.searchLocation();}
    else if(event.key==='Escape'){this.searchResults=[];this.activeSearchIndex=-1;}
  }
  searchLocation():void{
    const query=this.searchText.trim();if(!query)return;
    const cacheKey=query.toLowerCase();const cached=this.searchCache.get(cacheKey);if(cached){this.showSearchResults(cached);return;}
    if(this.searchSuggestionCount>=45)this.resetSearchSession();
    const requestId=++this.searchRequestId;this.searching=true;this.searchError='';this.searchSubscription?.unsubscribe();
    let params=new HttpParams().set('q',query.slice(0,256)).set('session_token',this.searchSessionToken).set('access_token',environment.mapboxAccessToken).set('country','US').set('language','en').set('limit','5');
    if(this.map){const center=this.map.getCenter();params=params.set('proximity',`${center.lng},${center.lat}`);}
    this.searchSuggestionCount++;
    this.searchSubscription=this.http.get<any>('https://api.mapbox.com/search/searchbox/v1/suggest',{params}).subscribe({
      next:response=>{
        if(requestId!==this.searchRequestId)return;const results:MapSearchResult[]=(response?.suggestions??[]).map((suggestion:any)=>({
          id:String(suggestion?.mapbox_id??''),
          label:String(suggestion?.full_address??[suggestion?.name_preferred??suggestion?.name,suggestion?.place_formatted].filter(Boolean).join(', ')??query),
        })).filter((result:MapSearchResult)=>!!result.id);
        if(this.searchCache.size>=20)this.searchCache.delete(this.searchCache.keys().next().value!);this.searchCache.set(cacheKey,results);this.showSearchResults(results);
      },
      error:()=>{if(requestId===this.searchRequestId){this.searching=false;this.searchError='Location search is unavailable. Check your connection and try again.';this.refreshView();}},
    });
  }
  selectSearchResult(result:MapSearchResult):void{
    const requestId=++this.searchRequestId;if(this.searchTimer)window.clearTimeout(this.searchTimer);this.searchSubscription?.unsubscribe();this.searching=true;this.searchText=result.label;this.searchResults=[];this.activeSearchIndex=-1;this.searchError='';
    const params=new HttpParams().set('session_token',this.searchSessionToken).set('access_token',environment.mapboxAccessToken).set('language','en');
    this.searchSubscription=this.http.get<any>(`https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(result.id)}`,{params}).subscribe({
      next:response=>{
        if(requestId!==this.searchRequestId)return;const feature=response?.features?.[0];const longitude=Number(feature?.geometry?.coordinates?.[0]);const latitude=Number(feature?.geometry?.coordinates?.[1]);
        if(!Number.isFinite(longitude)||!Number.isFinite(latitude)){this.searching=false;this.searchError='The selected location did not include map coordinates.';this.resetSearchSession();this.refreshView();return;}
        const bbox=Array.isArray(feature?.bbox)&&feature.bbox.length===4?feature.bbox.map(Number):undefined;this.searching=false;
        if(this.map){if(bbox)this.map.fitBounds([[bbox[0],bbox[1]],[bbox[2],bbox[3]]],{padding:45,maxZoom:15,duration:500});else this.map.flyTo({center:[longitude,latitude],zoom:14,duration:500});}
        this.resetSearchSession();this.refreshView();
      },
      error:()=>{if(requestId===this.searchRequestId){this.searching=false;this.searchError='The selected location could not be loaded.';this.resetSearchSession();this.refreshView();}},
    });
  }
  private showSearchResults(results:MapSearchResult[]):void{this.searchResults=results;this.activeSearchIndex=results.length?0:-1;this.searching=false;this.searchError=results.length?'':'No matching locations were found.';this.refreshView();}
  private resetSearchSession():void{this.searchSessionToken=crypto.randomUUID();this.searchSuggestionCount=0;this.searchCache.clear();}
  private refreshView():void{this.zone.run(()=>this.changeDetector.detectChanges());}
  private readInput():void{try{if(!this.territoryGeoJson){this.points=[];return;}let value:any=this.territoryGeoJson;for(let i=0;i<2&&typeof value==='string';i++)value=JSON.parse(value);const geometry=value?.type==='Feature'?value.geometry:value;const ring=geometry?.type==='Polygon'?geometry.coordinates?.[0]:null;if(!Array.isArray(ring)){this.points=[];return;}const points=ring.map((p:any)=>[Number(p?.[0]),Number(p?.[1])]).filter((p:number[])=>Number.isFinite(p[0])&&Number.isFinite(p[1]));if(points.length>1&&points[0][0]===points[points.length-1][0]&&points[0][1]===points[points.length-1][1])points.pop();this.points=points;}catch{this.points=[];}}
  private render(emit:boolean):void{const area=this.points.length>=3?areaOf([...this.points,this.points[0]]):0;this.updateTerritoryLayers();this.draw();if(emit){const geoJson=area?JSON.stringify({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[...this.points,this.points[0]]]}}):'';this.syncing=true;this.territoryChanged.emit({geoJson});queueMicrotask(()=>this.syncing=false);}}
  private draw():void{if(!this.map)return;const canvas=this.overlayElement.nativeElement,mapCanvas=this.map.getCanvas(),width=mapCanvas.clientWidth,height=mapCanvas.clientHeight,ratio=window.devicePixelRatio||1;if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;const context=canvas.getContext('2d');if(!context)return;context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,width,height);const projected=this.points.map(p=>this.map!.project(p as [number,number]));if(projected.length>=2){context.beginPath();context.moveTo(projected[0].x,projected[0].y);projected.slice(1).forEach(p=>context.lineTo(p.x,p.y));if(projected.length>=3){context.closePath();context.fillStyle='rgba(227,27,35,.28)';context.fill();}context.strokeStyle='#e31b23';context.lineWidth=4;context.lineJoin='round';context.stroke();}for(const p of projected){context.beginPath();context.arc(p.x,p.y,8,0,Math.PI*2);context.fillStyle='#e31b23';context.fill();context.strokeStyle='#fff';context.lineWidth=3;context.stroke();}}
  private fit():void{if(!this.map||!this.points.length)return;const bounds=this.points.reduce((b,p)=>b.extend(p as [number,number]),new this.mapbox!.LngLatBounds());this.map.fitBounds(bounds,{padding:45,maxZoom:14,duration:0});}
  private scheduleViewportSync():void{if(!this.map||!this.ready)return;this.syncTimers.forEach(timer=>window.clearTimeout(timer));this.syncTimers=[0,100,350].map(delay=>window.setTimeout(()=>{if(!this.map)return;this.map.resize();this.fit();this.draw();},delay));}
  private initializeTerritoryLayers():void{
    if(!this.map||this.map.getSource('customer-territory'))return;
    this.map.addSource('customer-territory',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    this.map.addLayer({id:'customer-territory-fill',type:'fill',source:'customer-territory',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':'#e31b23','fill-opacity':.28}});
    this.map.addLayer({id:'customer-territory-line',type:'line',source:'customer-territory',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#e31b23','line-width':4}});
    this.map.addLayer({id:'customer-territory-points',type:'circle',source:'customer-territory',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':8,'circle-color':'#e31b23','circle-stroke-color':'#fff','circle-stroke-width':3}});
  }
  private updateTerritoryLayers():void{
    if(!this.map||!this.ready)return;
    const source=this.map.getSource('customer-territory') as any;if(!source?.setData)return;
    const features:any[]=[];
    if(this.points.length>=3)features.push({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[...this.points,this.points[0]]]}});
    if(this.points.length>=2)features.push({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:this.points.length>=3?[...this.points,this.points[0]]:this.points}});
    for(const point of this.points)features.push({type:'Feature',properties:{},geometry:{type:'Point',coordinates:point}});
    source.setData({type:'FeatureCollection',features});
  }
}
interface MapSearchResult{id:string;label:string;}
function areaOf(ring:number[][]):number{const radius=6378137;let total=0;for(let i=0;i<ring.length-1;i++)total+=rad(ring[i+1][0]-ring[i][0])*(2+Math.sin(rad(ring[i][1]))+Math.sin(rad(ring[i+1][1])));return Math.abs(total*radius*radius/2);}
function rad(value:number):number{return value*Math.PI/180;}
function rasterStyle(token:string):any{return{version:8,sources:{streets:{type:'raster',tiles:[`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${encodeURIComponent(token)}`],tileSize:512,attribution:'© Mapbox © OpenStreetMap'}},layers:[{id:'streets',type:'raster',source:'streets'}]};}
