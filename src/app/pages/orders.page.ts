import {CommonModule} from '@angular/common';
import {Component,computed,inject,signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {IonButton,IonCard,IonCardContent,IonIcon,IonLabel,IonSegment,IonSegmentButton} from '@ionic/angular/standalone';
import {CustomerApiService,CustomerOrder} from '../services/customer-api.service';
import {MobileShellComponent} from '../shared/mobile-shell.component';
import {LoaderComponent} from '../shared/loader.component';
@Component({selector:'app-orders',standalone:true,imports:[CommonModule,FormsModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,IonLabel,IonSegment,IonSegmentButton,MobileShellComponent,LoaderComponent],template:`<wf-customer-shell title="My orders" subtitle="Fuel deliveries" [showNav]="true">
@if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading orders..." /></section>}
@else{<main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
<ion-segment [ngModel]="filter()" (ngModelChange)="filter.set($event)"><ion-segment-button value="active"><ion-label>Active</ion-label></ion-segment-button><ion-segment-button value="past"><ion-label>Past</ion-label></ion-segment-button><ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button></ion-segment><ion-button class="wf-button" expand="block" routerLink="/new-order"><ion-icon slot="start" name="add-outline"></ion-icon>New fuel order</ion-button>@for(order of visible();track order.id){<ion-card class="wf-card" [routerLink]="['/order-status',order.id]"><ion-card-content><div class="row-between"><span class="pill" [class.info]="order.status==='in_progress'" [class.success]="order.status==='completed'" [class.warning]="order.status==='scheduled'">{{order.status.replace('_',' ')}}</span><strong>{{order.orderNumber}}</strong></div><h3>{{order.siteName}}</h3><p class="caption">{{order.equipmentName}}</p><div class="detail-row"><span>{{order.requestedDate|date:'mediumDate'}} · {{order.deliveryWindow}}</span><strong>{{order.requestedGallons}} gal</strong></div><div class="row-between"><span class="caption">{{order.fuelType}}</span><ion-icon name="chevron-forward-outline"></ion-icon></div></ion-card-content></ion-card>}@empty{<ion-card class="wf-card soft-card text-center"><ion-card-content><div class="icon-tile" style="margin:0 auto 10px"><ion-icon name="receipt-outline"></ion-icon></div><strong>No orders in this view</strong><p class="caption">Try a different filter or place a new fuel order.</p></ion-card-content></ion-card>}</main>}
</wf-customer-shell>`})
export class OrdersPage{
  private readonly api=inject(CustomerApiService);
  readonly orders=signal<CustomerOrder[]>([]);
  readonly filter=signal('active');
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  readonly visible=computed(()=>{const rows=this.orders();if(this.filter()==='active')return rows.filter(x=>!['completed','cancelled'].includes(x.status));if(this.filter()==='past')return rows.filter(x=>['completed','cancelled'].includes(x.status));return rows;});
  ionViewWillEnter():void{this.load();}
  load():void{
    this.loading.set(true);this.error.set('');
    this.api.getOrders().subscribe({
      next:rows=>{this.orders.set(rows);this.hasLoaded.set(true);this.loading.set(false);},
      error:()=>{this.error.set('Orders could not be loaded. Check your connection and try again.');this.loading.set(false);},
    });
  }
}
