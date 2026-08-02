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
@else{<ng-container><main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
<ion-segment [scrollable]="true" [ngModel]="filter()" (ngModelChange)="filter.set($event)"><ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button><ion-segment-button value="active"><ion-label>Active</ion-label></ion-segment-button><ion-segment-button value="transit"><ion-label>In Transit</ion-label></ion-segment-button><ion-segment-button value="delivered"><ion-label>Delivered</ion-label></ion-segment-button><ion-segment-button value="past"><ion-label>Past Orders</ion-label></ion-segment-button></ion-segment>
@for(order of visible();track order.id){<ion-card class="wf-card" [routerLink]="['/order-status',order.id]"><ion-card-content><div class="row-between"><span class="pill" [ngClass]="order.statusTone || 'info'">{{order.statusLabel || order.status}}</span><strong>{{order.orderNumber}}</strong></div><h3>{{order.siteName}}</h3><p class="caption">{{order.equipmentName}}</p><div class="detail-row"><span>{{order.requestedDate|date:'mediumDate'}} · {{order.deliveryWindow}}</span><strong>{{order.requestedGallons}} gal</strong></div><div class="row-between"><span class="caption">{{order.fuelType}}</span><ion-icon name="chevron-forward-outline"></ion-icon></div></ion-card-content></ion-card>}
@empty{<div class="empty-state"><div class="empty-icon"><ion-icon name="receipt-outline"></ion-icon></div><strong>{{emptyStateCopy().title}}</strong><p class="caption">{{emptyStateCopy().message}}</p><ion-button size="small" class="empty-cta" routerLink="/new-order"><ion-icon slot="start" name="add-outline"></ion-icon>New fuel order</ion-button></div>}
</main>
</ng-container>}
</wf-customer-shell>`,
styles:[`
  .empty-state{min-height:36vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;padding:20px}
  .empty-icon{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:var(--wf-primary-soft);color:var(--wf-primary);font-size:28px;margin-bottom:6px}
  .empty-state strong{font-size:16px}
  .empty-state .caption{max-width:260px}
  .empty-cta{margin-top:12px;--border-radius:12px;font-weight:800;text-transform:none}
`]})
export class OrdersPage{
  private readonly api=inject(CustomerApiService);
  readonly orders=signal<CustomerOrder[]>([]);
  readonly filter=signal('active');
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  readonly visible=computed(()=>{
    const rows=this.orders();
    switch(this.filter()){
      case 'active':return rows.filter(x=>x.statusGroup==='active');
      case 'transit':return rows.filter(x=>x.statusGroup==='in_transit');
      case 'delivered':return rows.filter(x=>x.statusGroup==='delivered');
      case 'past':return rows.filter(x=>x.statusGroup==='delivered'||x.statusGroup==='cancelled');
      default:return rows;
    }
  });
  readonly emptyStateCopy=computed(():{title:string;message:string}=>{
    switch(this.filter()){
      case 'active':return {title:'No active orders',message:'Orders you place will show up here while they\'re being prepared or delivered.'};
      case 'transit':return {title:'Nothing in transit',message:'Orders on their way to you will appear here.'};
      case 'delivered':return {title:'No deliveries yet',message:'Delivered orders will show up here.'};
      case 'past':return {title:'No past orders',message:'Your delivered and cancelled orders will appear here.'};
      default:return {title:'No orders yet',message:'Place your first fuel order to see it here.'};
    }
  });
  ionViewWillEnter():void{this.load();}
  load():void{
    this.loading.set(true);this.error.set('');
    this.api.getOrders().subscribe({
      next:rows=>{this.orders.set(rows);this.hasLoaded.set(true);this.loading.set(false);},
      error:()=>{this.error.set('Orders could not be loaded. Check your connection and try again.');this.loading.set(false);},
    });
  }
}
