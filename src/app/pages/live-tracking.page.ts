import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerJob } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({selector:'app-live-tracking',standalone:true,imports:[CommonModule,IonButton,IonCard,IonCardContent,IonIcon,MobileShellComponent],template:`
<wf-customer-shell title="Delivery status" [subtitle]="job()?.jobNumber||'Dispatch'" backRoute="/home"><main class="screen-body stack">@if(job();as x){
  <div class="map-mock"><div class="route-line"></div><div class="map-pin driver-pin" style="left:28%;top:55%"><span>●</span></div><div class="map-pin" style="right:18%;top:20%"><span>●</span></div></div>
  <ion-card class="wf-card"><ion-card-content><div class="row-between"><div><span class="pill info">{{label(x.status)}}</span><h2 style="margin:12px 0 4px">{{message(x)}}</h2><p class="caption">Scheduled {{x.scheduledAt|date:'medium'}}</p></div><div class="avatar">{{initials(x.driverName)}}</div></div><hr class="divider"><div class="row-between"><div><strong>{{x.vehicleUnitNumber||x.vehicleName||'Vehicle pending'}}</strong><p class="caption">{{x.driverName||'Driver pending'}}</p></div>@if(x.siteContactPhone){<ion-button fill="outline" shape="round" [href]="'tel:'+x.siteContactPhone"><ion-icon name="call-outline"></ion-icon></ion-button>}</div></ion-card-content></ion-card>
  <ion-card class="wf-card soft-card"><ion-card-content class="row"><ion-icon name="information-circle-outline" style="font-size:24px"></ion-icon><p class="caption" style="margin:0">Status updates come from verified driver workflow events. Live vehicle coordinates are not currently available.</p></ion-card-content></ion-card>
}@else{<ion-card class="wf-card"><ion-card-content>Loading delivery status...</ion-card-content></ion-card>}</main></wf-customer-shell>`})
export class LiveTrackingPage {
  private readonly route=inject(ActivatedRoute);private readonly api=inject(CustomerApiService);readonly job=signal<CustomerJob|null>(null);
  ngOnInit():void{const id=this.route.snapshot.paramMap.get('id');if(id)this.api.getJob(id).subscribe(x=>this.job.set(x));}
  label(value:string):string{return value.replace(/_/g,' ').replace(/\b\w/g,x=>x.toUpperCase());}
  initials(name?:string):string{return (name||'DP').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();}
  message(job:CustomerJob):string{return ({pending:'Waiting for driver assignment',assigned:'Driver assigned',started:'Driver is traveling to your site',arrived:'Driver has arrived',equipment_verified:'Equipment verified',fueling:'Fuel delivery in progress',proof_pending:'Delivery proof is being finalized',completed:'Delivery completed'} as Record<string,string>)[job.status]||'Dispatch is being updated';}
}
