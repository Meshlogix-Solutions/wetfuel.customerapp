import {CommonModule} from '@angular/common';
import {Component,inject,signal} from '@angular/core';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {IonButton,IonCard,IonCardContent} from '@ionic/angular/standalone';
import {CustomerApiService,CustomerOrder} from '../services/customer-api.service';
import {ConfirmService} from '../services/confirm.service';
import {MobileShellComponent} from '../shared/mobile-shell.component';

@Component({selector:'app-order-status',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,MobileShellComponent],template:`
<wf-customer-shell [title]="order()?.orderNumber||'Order'" [subtitle]="label(order()?.status)" backRoute="/orders"><main class="screen-body stack">@if(order();as x){
  <ion-card class="wf-card hero-card"><ion-card-content><span class="pill dark">{{label(x.status)}}</span><h2>{{x.requestedGallons}} gal · {{x.fuelType}}</h2><p>{{x.siteName}} · {{x.deliveryWindow}}</p></ion-card-content></ion-card>
  <ion-card class="wf-card"><ion-card-content><div class="detail-row"><span>Equipment</span><strong>{{x.equipmentName}}</strong></div><div class="detail-row"><span>Requested date</span><strong>{{x.requestedDate|date:'mediumDate'}}</strong></div><div class="detail-row"><span>Estimated total</span><strong>{{x.estimatedTotal|currency}}</strong></div><div class="detail-row"><span>Driver</span><strong>{{x.driverName||'Waiting for dispatch'}}</strong></div><div class="detail-row"><span>Job</span><strong>{{x.jobNumber||'Not assigned'}}</strong></div></ion-card-content></ion-card>
  @if(x.driverJobId){<ion-button class="wf-button" expand="block" [routerLink]="['/live-tracking',x.driverJobId]">View delivery status</ion-button>}
  @if(['submitted','approved'].includes(x.status)){<ion-button class="wf-button wf-secondary" expand="block" [disabled]="cancelling" (click)="cancel(x)">{{cancelling?'Cancelling...':'Cancel order'}}</ion-button>}
}@else{<p>Loading order...</p>}</main></wf-customer-shell>`})
export class OrderStatusPage {
  private readonly route=inject(ActivatedRoute);private readonly api=inject(CustomerApiService);private readonly confirm=inject(ConfirmService);
  readonly order=signal<CustomerOrder|null>(null);cancelling=false;
  ngOnInit():void{this.load();}
  load():void{const id=this.route.snapshot.paramMap.get('id');if(id)this.api.getOrder(id).subscribe(x=>this.order.set(x));}
  label(x?:string):string{return (x??'').replace(/_/g,' ').replace(/\b\w/g,v=>v.toUpperCase());}
  async cancel(x:CustomerOrder):Promise<void>{if(!await this.confirm.danger('Cancel this fuel order?','Dispatch will no longer schedule this order.','Cancel order'))return;this.cancelling=true;this.api.cancelOrder(x.id).subscribe({next:()=>this.load(),complete:()=>this.cancelling=false,error:()=>this.cancelling=false});}
}
