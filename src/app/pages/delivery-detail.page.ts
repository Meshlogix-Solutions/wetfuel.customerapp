import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerJob } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';

@Component({selector:'app-delivery-detail',standalone:true,imports:[CommonModule,IonCard,IonCardContent,IonCardHeader,IonCardTitle,IonIcon,MobileShellComponent,LoaderComponent],template:`
<wf-customer-shell [title]="job()?.jobNumber||'Delivery'" [subtitle]="job()?.completedAt ? ('Completed ' + (job()?.completedAt|date:'mediumDate')) : 'Delivery record'" backRoute="/deliveries" [showNav]="true">
  <main class="screen-body stack">@if(job();as x){
    <ion-card class="wf-card soft-card"><ion-card-content class="text-center"><div class="success-orb" style="width:76px;height:76px"><ion-icon name="checkmark-circle-outline" style="font-size:42px"></ion-icon></div><h2>{{x.deliveredGallons??x.targetGallons}} gallons delivered</h2><p class="caption">Completed {{x.completedAt|date:'medium'}} by {{x.driverName}}</p></ion-card-content></ion-card>
    <ion-card class="wf-card"><ion-card-content><div class="detail-row"><span>Location</span><strong>{{x.siteName}}</strong></div><div class="detail-row"><span>Equipment</span><strong>{{x.equipmentName||'—'}}</strong></div><div class="detail-row"><span>Fuel product</span><strong>{{x.fuelType}}</strong></div><div class="detail-row"><span>Start meter</span><strong>{{x.startingTotalizer??'—'}}</strong></div><div class="detail-row"><span>End meter</span><strong>{{x.endingTotalizer??'—'}}</strong></div><div class="detail-row"><span>Driver</span><strong>{{x.driverName}}</strong></div><div class="detail-row"><span>Vehicle</span><strong>{{x.vehicleUnitNumber||x.vehicleName||'—'}}</strong></div></ion-card-content></ion-card>
    <ion-card class="wf-card"><ion-card-header><ion-card-title>Delivery verification</ion-card-title></ion-card-header><ion-card-content><p class="caption">Equipment QR {{x.equipmentQrCode||'not recorded'}} · Site arrival {{x.arrivedAt|date:'medium'}}</p>@if(x.deliveryNotes){<p>{{x.deliveryNotes}}</p>}</ion-card-content></ion-card>
  }@else if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}@else{<section><wf-loader mode="section" message="Loading delivery..." /></section>}</main>
</wf-customer-shell>`})
export class DeliveryDetailPage {
  private readonly route=inject(ActivatedRoute);private readonly api=inject(CustomerApiService);
  readonly job=signal<CustomerJob|null>(null);readonly error=signal('');
  ngOnInit():void{this.load();}
  load():void{
    const id=this.route.snapshot.paramMap.get('id');if(!id)return;
    this.error.set('');
    this.api.getJob(id).subscribe({next:x=>this.job.set(x),error:()=>this.error.set('This delivery could not be loaded. Check your connection and try again.')});
  }
}
