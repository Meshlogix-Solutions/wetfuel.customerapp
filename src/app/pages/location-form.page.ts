import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonInput, IonItem, IonSelect, IonSelectOption, IonToggle } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { CustomerApiService, CustomerSite } from '../services/customer-api.service';
import { CustomerStateService } from '../services/customer-state.service';
import { ToastService } from '../services/toast.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { CustomerMapboxTerritoryEditorComponent, CustomerTerritorySelection } from '../shared/mapbox-territory-editor.component';
import { US_STATES, usStateCode } from '../data/us-states';
@Component({selector:'app-location-form',standalone:true,imports:[FormsModule,IonButton,IonCard,IonCardContent,IonInput,IonItem,IonSelect,IonSelectOption,IonToggle,MobileShellComponent,CustomerMapboxTerritoryEditorComponent],template:`
<wf-customer-shell [title]="id?'Edit site':'Add site'" [subtitle]="id?'Update site details and territory':(step()===1?'Step 1 of 2 · Site details':'Step 2 of 2 · Equipment (optional)')" backRoute="/locations" [showNav]="true"><main class="screen-body stack">

@if(step()===1){
<ion-card class="wf-card form-card"><ion-card-content class="stack">
<ion-item><ion-input label="Location name" labelPlacement="stacked" [(ngModel)]="siteForm.name" placeholder="e.g. South Distribution Center"></ion-input></ion-item>
<ion-item><ion-input label="Street address" labelPlacement="stacked" [(ngModel)]="siteForm.address"></ion-input></ion-item>
<div class="grid-2"><ion-item><ion-input label="City" labelPlacement="stacked" [(ngModel)]="siteForm.city"></ion-input></ion-item><ion-item><ion-select label="State" labelPlacement="stacked" placeholder="Select state" [(ngModel)]="siteForm.state">@for(state of states;track state.code){<ion-select-option [value]="state.code">{{state.name}}</ion-select-option>}</ion-select></ion-item></div>
<ion-item><ion-input label="ZIP code" labelPlacement="stacked" [(ngModel)]="siteForm.zipCode"></ion-input></ion-item>
@if(!loadingSite()){<app-mapbox-territory-editor [territoryGeoJson]="siteForm.territoryGeoJson" (territoryChanged)="applyTerritory($event)" />}
<ion-item><ion-input label="On-site contact" labelPlacement="stacked" [(ngModel)]="siteForm.contactName"></ion-input></ion-item>
<ion-item><ion-input label="Contact phone" labelPlacement="stacked" type="tel" [(ngModel)]="siteForm.contactPhone"></ion-input></ion-item>
<ion-toggle [(ngModel)]="siteForm.isDefault">Make this my primary location</ion-toggle>
</ion-card-content></ion-card>
<ion-button class="wf-button" expand="block" [disabled]="saving" (click)="saveSite()">{{saving?'Saving...':(id?'Save changes':'Continue')}}</ion-button>
}

@if(step()===2){
<ion-card class="wf-card soft-card"><ion-card-content><strong>{{createdSite()?.name}}</strong><p class="caption" style="margin:4px 0 0">Site saved. Add the equipment at this location now, or skip and add it later.</p></ion-card-content></ion-card>
<ion-card class="wf-card form-card"><ion-card-content class="stack">
<ion-item><ion-input label="Equipment name" labelPlacement="stacked" [(ngModel)]="equipmentForm.name"></ion-input></ion-item>
<ion-item><ion-select label="Equipment type" labelPlacement="stacked" [(ngModel)]="equipmentForm.type"><ion-select-option value="tank">Storage tank</ion-select-option><ion-select-option value="generator">Generator</ion-select-option><ion-select-option value="pump">Pump</ion-select-option><ion-select-option value="vehicle_tank">Vehicle tank</ion-select-option><ion-select-option value="other">Other</ion-select-option></ion-select></ion-item>
<ion-item><ion-select label="Fuel product" labelPlacement="stacked" [(ngModel)]="equipmentForm.fuelType"><ion-select-option value="diesel">Diesel</ion-select-option><ion-select-option value="off_road_diesel">Off-road Diesel</ion-select-option><ion-select-option value="gasoline_regular">Regular Unleaded</ion-select-option><ion-select-option value="gasoline_premium">Premium Unleaded</ion-select-option></ion-select></ion-item>
<ion-item><ion-input label="Capacity in gallons" labelPlacement="stacked" type="number" [(ngModel)]="equipmentForm.capacityGallons"></ion-input></ion-item>
<ion-item><ion-input label="Estimated level %" labelPlacement="stacked" type="number" [(ngModel)]="equipmentForm.estimatedLevelPercent"></ion-input></ion-item>
</ion-card-content></ion-card>
<ion-button class="wf-button" expand="block" [disabled]="saving" (click)="saveEquipment()">{{saving?'Saving...':'Add equipment'}}</ion-button>
<ion-button class="wf-button wf-secondary" expand="block" [disabled]="saving" (click)="skip()">Skip for now</ion-button>
}

</main></wf-customer-shell>`})
export class LocationFormPage{
  private readonly api=inject(CustomerApiService);private readonly router=inject(Router);private readonly toast=inject(ToastService);
  private readonly route=inject(ActivatedRoute);private readonly state=inject(CustomerStateService);
  readonly id=this.route.snapshot.paramMap.get('id');
  private readonly returnUrl=this.route.snapshot.queryParamMap.get('returnUrl')||'/locations';
  saving=false;
  readonly loadingSite=signal(!!this.id);
  readonly states=US_STATES;
  readonly step=signal<1|2>(1);
  readonly createdSite=signal<CustomerSite|null>(null);
  siteForm={name:'',address:'',city:'',state:'',zipCode:'',territoryGeoJson:'',contactName:'',contactPhone:'',isDefault:false};
  equipmentForm={name:'',type:'tank',fuelType:'diesel',capacityGallons:null as number|null,estimatedLevelPercent:null as number|null};

  constructor(){
    if(this.id)this.api.getSites().subscribe({
      next:sites=>{
        const site=sites.find(x=>x.id===this.id);
        if(!site){void this.toast.error('The site could not be found.');void this.router.navigateByUrl('/locations');return;}
        this.siteForm={name:site.name,address:site.address,city:site.city,state:usStateCode(site.state),zipCode:site.zipCode,
          territoryGeoJson:site.territoryGeoJson??'',contactName:site.contactName??'',contactPhone:site.contactPhone??'',isDefault:site.isDefault};
        this.loadingSite.set(false);
      },
      error:()=>{this.loadingSite.set(false);void this.toast.error('The site could not be loaded.');},
    });
  }

  async saveSite():Promise<void>{
    if(!this.siteForm.name.trim()||!this.siteForm.address.trim()||!this.siteForm.city.trim()||this.siteForm.state.trim().length!==2||!this.siteForm.zipCode.trim()||!this.siteForm.territoryGeoJson){void this.toast.error('Complete the site details and draw the delivery territory.');return;}
    this.saving=true;
    try{
      const request={...this.siteForm,contactName:this.siteForm.contactName||undefined,contactPhone:this.siteForm.contactPhone||undefined};
      const site=await firstValueFrom(this.id?this.api.updateSite(this.id,request):this.api.addSite(request));
      this.createdSite.set(site);
      if(this.id){void this.toast.success('Site territory updated.');void this.router.navigateByUrl(this.returnUrl);}
      else this.step.set(2);
    }catch{
      void this.toast.error('The location could not be saved.');
    }finally{
      this.saving=false;
    }
  }

  applyTerritory(value:CustomerTerritorySelection):void{this.siteForm.territoryGeoJson=value.geoJson;}

  async saveEquipment():Promise<void>{
    const site=this.createdSite();
    if(!site)return;
    if(!this.equipmentForm.name.trim()){void this.toast.error('Enter an equipment name.');return;}
    this.saving=true;
    try{
      await firstValueFrom(this.api.createEquipment({
        siteId:site.id,name:this.equipmentForm.name,type:this.equipmentForm.type,fuelType:this.equipmentForm.fuelType,
        capacityGallons:this.equipmentForm.capacityGallons??undefined,estimatedLevelPercent:this.equipmentForm.estimatedLevelPercent??undefined,
      }));
      this.finish();
    }catch{
      void this.toast.error('The equipment could not be saved.');
    }finally{
      this.saving=false;
    }
  }

  skip():void{this.finish();}

  private finish():void{
    const site=this.createdSite();
    if(site&&this.returnUrl!=='/locations')this.state.selectLocation(site);
    void this.router.navigateByUrl(this.returnUrl);
  }
}
