import {CommonModule} from '@angular/common';
import {Component,inject,signal} from '@angular/core';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {IonButton,IonCard,IonCardContent} from '@ionic/angular/standalone';
import {CustomerApiService,CustomerOrder} from '../services/customer-api.service';
import {ConfirmService} from '../services/confirm.service';
import {MobileShellComponent} from '../shared/mobile-shell.component';
import {LoaderComponent} from '../shared/loader.component';
import {ToastService} from '../services/toast.service';

@Component({selector:'app-order-status',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,MobileShellComponent,LoaderComponent],template:`
<wf-customer-shell [title]="order()?.orderNumber||'Order'" [subtitle]="order()?.statusLabel||''" backRoute="/orders" [showNav]="true"><main class="screen-body stack">@if(order();as x){
  <ion-card class="wf-card hero-card"><ion-card-content><span class="pill dark">{{x.statusLabel}}</span><h2>{{x.requestedGallons}} gal · {{x.fuelType}}</h2><p>{{x.siteName}} · {{x.deliveryWindow}}</p></ion-card-content></ion-card>
  <ion-card class="wf-card"><ion-card-content><div class="detail-row"><span>Equipment</span><strong>{{x.equipmentName}}</strong></div><div class="detail-row"><span>Requested date</span><strong>{{x.requestedDate|date:'mediumDate'}}</strong></div><div class="detail-row"><span>Estimated total</span><strong>{{x.estimatedTotal|currency}}</strong></div><div class="detail-row"><span>Driver</span><strong>{{x.driverName||'Waiting for dispatch'}}</strong></div><div class="detail-row"><span>Job</span><strong>{{x.jobNumber||'Not assigned'}}</strong></div></ion-card-content></ion-card>
  @if(x.driverJobId){<ion-button class="wf-button" expand="block" [routerLink]="['/live-tracking',x.driverJobId]">View delivery status</ion-button>}
  @if(x.canCancel){<ion-button class="wf-button wf-secondary" expand="block" [disabled]="cancelling" (click)="cancel(x)">{{cancelling?'Cancelling...':'Cancel order'}}</ion-button>}
}@else if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}@else{<section><wf-loader mode="section" message="Loading order..." /></section>}</main></wf-customer-shell>`})
export class OrderStatusPage {
  private readonly route=inject(ActivatedRoute);private readonly api=inject(CustomerApiService);private readonly confirm=inject(ConfirmService);private readonly toast=inject(ToastService);
  readonly order=signal<CustomerOrder|null>(null);readonly error=signal('');cancelling=false;
  ngOnInit():void{this.load();}
  load():void{
    const id=this.route.snapshot.paramMap.get('id');if(!id)return;
    this.error.set('');
    this.api.getOrder(id).subscribe({next:x=>this.order.set(x),error:()=>this.error.set('This order could not be loaded. Check your connection and try again.')});
  }
  async cancel(x:CustomerOrder):Promise<void>{if(!await this.confirm.danger('Cancel this fuel order?','Dispatch will no longer schedule this order.','Cancel order'))return;this.cancelling=true;this.api.cancelOrder(x.id).subscribe({next:()=>this.load(),complete:()=>this.cancelling=false,error:()=>{this.cancelling=false;void this.toast.error('This order could not be cancelled. Try again.');}});}
}
