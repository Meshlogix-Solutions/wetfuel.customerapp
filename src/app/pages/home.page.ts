import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { CustomerApiService, CustomerEquipment, CustomerInvoice, CustomerJob, CustomerOrder, CustomerProfile } from '../services/customer-api.service';
import { MobileShellComponent, RefreshRequest } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';

@Component({selector:'app-home',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,MobileShellComponent,LoaderComponent],template:`
<wf-customer-shell [title]="greeting() + ', ' + (profile()?.contactFirstName || 'there')" [subtitle]="profile()?.companyName || 'Customer account'" [showNav]="true" [refreshable]="true" (refreshRequested)="refreshHome($event)">
@if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading your dashboard..." /></section>}
@else{<main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
@if(activeJob();as job){<ion-card class="wf-card hero-card"><ion-card-content><div class="row-between"><div><span class="pill dark">{{statusLabel(job.status)}}</span><h2 style="margin:16px 0 5px">{{job.siteName}}</h2><p class="caption" style="margin:0">{{job.jobNumber}} · {{job.scheduledAt|date:'medium'}}</p></div><div class="icon-tile"><ion-icon name="truck-outline"></ion-icon></div></div><div style="height:16px"></div><ion-button class="wf-button" color="tertiary" expand="block" [routerLink]="['/live-tracking',job.id]">View delivery status</ion-button></ion-card-content></ion-card>}
@else if(nextOrder();as order){<ion-card class="wf-card" [routerLink]="['/order-status',order.id]"><ion-card-content><div class="row-between"><div><span class="pill info">{{statusLabel(order.status)}}</span><h2 style="margin:12px 0 4px">{{order.requestedGallons}} gal · {{order.fuelType}}</h2><p class="caption" style="margin:0">{{order.siteName}} · {{order.requestedDate|date:'mediumDate'}} · {{order.deliveryWindow}}</p></div><ion-icon name="chevron-forward-outline"></ion-icon></div></ion-card-content></ion-card>}
<ion-button class="wf-button" expand="block" routerLink="/new-order"><ion-icon slot="start" name="add-outline"></ion-icon>Order fuel</ion-button>

<section><div class="row-between"><h2 class="section-title">Billing</h2><a routerLink="/invoices" class="caption">View all</a></div><ion-card class="wf-card" [class.warning-card]="openInvoiceCount()>0" routerLink="/invoices"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="card-outline"></ion-icon></div><div class="grow">@if(openInvoiceCount()>0){<strong>{{openInvoiceTotal()|currency}}</strong><p class="caption" style="margin:3px 0 0">{{openInvoiceCount()}} invoice{{openInvoiceCount()===1?'':'s'}} due</p>}@else{<strong>You're all caught up</strong><p class="caption" style="margin:3px 0 0">No open invoices</p>}</div><ion-icon name="chevron-forward-outline"></ion-icon></ion-card-content></ion-card></section>

@if(attentionEquipment();as item){<section><div class="row-between"><h2 class="section-title">Equipment attention</h2><a routerLink="/equipment" class="caption">View all</a></div><ion-card class="wf-card warning-card" [routerLink]="['/equipment-detail',item.id]"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="cube-outline"></ion-icon></div><div class="grow"><strong>{{item.name}}</strong><p class="caption" style="margin:5px 0 9px">{{item.siteName}} · estimated {{item.estimatedLevelPercent || 0}}% remaining</p><div class="progress-track orange"><span [style.width.%]="item.estimatedLevelPercent || 0"></span></div></div><ion-icon name="chevron-forward-outline"></ion-icon></div></ion-card-content></ion-card></section>}

@if(recentOrders().length){<section><div class="row-between"><h2 class="section-title">Recent orders</h2><a routerLink="/orders" class="caption">View all</a></div><div class="stack" style="gap:8px">@for(order of recentOrders();track order.id){<ion-card class="wf-card compact" [routerLink]="['/order-status',order.id]"><ion-card-content class="row-between"><div><span class="pill" [class.info]="order.status==='in_progress'" [class.success]="order.status==='completed'" [class.warning]="!['in_progress','completed'].includes(order.status)">{{statusLabel(order.status)}}</span><p class="caption" style="margin:6px 0 0">{{order.siteName}} · {{order.requestedGallons}} gal</p></div><ion-icon name="chevron-forward-outline"></ion-icon></ion-card-content></ion-card>}</div></section>}

@if(recentDeliveries().length){<section><div class="row-between"><h2 class="section-title">Recent deliveries</h2><a routerLink="/deliveries" class="caption">View all</a></div><div class="stack" style="gap:8px">@for(job of recentDeliveries();track job.id){<ion-card class="wf-card compact" [routerLink]="['/delivery-detail',job.id]"><ion-card-content class="row-between"><div><strong>{{job.deliveredGallons??job.targetGallons}} gal</strong><p class="caption" style="margin:3px 0 0">{{job.siteName}} · {{job.completedAt|date:'mediumDate'}}</p></div><ion-icon name="chevron-forward-outline"></ion-icon></ion-card-content></ion-card>}</div></section>}

<section><h2 class="section-title">Account totals</h2><section class="grid-2"><ion-card class="wf-card"><ion-card-content class="metric"><span class="label">Lifetime deliveries</span><strong>{{profile()?.totalDeliveries??0}}</strong><span class="caption">Completed</span></ion-card-content></ion-card><ion-card class="wf-card"><ion-card-content class="metric"><span class="label">Lifetime fuel</span><strong>{{(profile()?.totalGallonsDelivered??0)|number:'1.0-0'}}</strong><span class="caption">Gallons delivered</span></ion-card-content></ion-card></section></section>

<section><h2 class="section-title">Quick access</h2><div class="grid-2"><ion-card class="wf-card" routerLink="/locations"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="location-outline"></ion-icon></div><strong>Locations</strong></ion-card-content></ion-card><ion-card class="wf-card" routerLink="/support"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="help-circle-outline"></ion-icon></div><strong>Support</strong></ion-card-content></ion-card></div></section>
</main>}
</wf-customer-shell>`})
export class HomePage {
  private readonly api=inject(CustomerApiService);
  readonly profile=signal<CustomerProfile|null>(null);
  readonly equipment=signal<CustomerEquipment[]>([]);
  readonly orders=signal<CustomerOrder[]>([]);
  readonly jobs=signal<CustomerJob[]>([]);
  readonly invoices=signal<CustomerInvoice[]>([]);
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  readonly greeting=computed(()=>{const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';});
  readonly activeJob=computed(()=>this.jobs().find(x=>!['completed','cancelled'].includes(x.status))??null);
  readonly nextOrder=computed(()=>{
    const upcoming=this.orders().filter(x=>!['completed','cancelled'].includes(x.status));
    return upcoming.sort((a,b)=>new Date(a.requestedDate).getTime()-new Date(b.requestedDate).getTime())[0]??null;
  });
  readonly openInvoiceCount=computed(()=>this.invoices().filter(x=>x.status==='sent').length);
  readonly openInvoiceTotal=computed(()=>this.invoices().filter(x=>x.status==='sent').reduce((sum,x)=>sum+x.total,0));
  readonly attentionEquipment=computed(()=>this.equipment().find(x=>x.status==='active'&&Number(x.estimatedLevelPercent??0)<=35)??null);
  readonly recentOrders=computed(()=>[...this.orders()].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,2));
  readonly recentDeliveries=computed(()=>this.jobs().filter(x=>x.status==='completed').sort((a,b)=>new Date(b.completedAt??0).getTime()-new Date(a.completedAt??0).getTime()).slice(0,2));
  statusLabel(value:string):string{return value.replace(/_/g,' ').replace(/\b\w/g,x=>x.toUpperCase());}
  ionViewWillEnter():void{void this.load();}
  async refreshHome(request:RefreshRequest):Promise<void>{try{await this.load();}finally{request.complete();}}
  async load():Promise<void>{
    this.loading.set(true);this.error.set('');
    try{
      const [profile,equipment,orders,jobs,invoices]=await Promise.all([firstValueFrom(this.api.getCurrentCustomer()),firstValueFrom(this.api.getEquipment()),firstValueFrom(this.api.getOrders()),firstValueFrom(this.api.getJobs()),firstValueFrom(this.api.getInvoices())]);
      this.profile.set(profile);this.equipment.set(equipment);this.orders.set(orders);this.jobs.set(jobs);this.invoices.set(invoices);
      this.hasLoaded.set(true);
    }catch{
      this.error.set('Your dashboard could not be loaded. Check your connection and try again.');
    }finally{
      this.loading.set(false);
    }
  }
}
