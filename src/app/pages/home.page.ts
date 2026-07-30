import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { CustomerApiService, CustomerEquipment, CustomerInvoice, CustomerJob, CustomerOrder, CustomerProfile } from '../services/customer-api.service';
import { MobileShellComponent, RefreshRequest } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';
import { deliveryStatusIcon } from '../shared/status';

interface HeroDelivery { orderNumber:string; dayLabel:string; timeLabel:string; site:string; gallons:number; fuelType:string; trackRoute:(string|number)[]; scheduledAt:string; statusLabel:string; statusIcon:string; }

@Component({selector:'app-home',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,MobileShellComponent,LoaderComponent],template:`
<wf-customer-shell [title]="profile()?.companyName || 'Your account'" [subtitle]="greeting() + ','" [showNav]="true" [refreshable]="true" (refreshRequested)="refreshHome($event)">
@if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading your dashboard..." /></section>}
@else{<ng-container><main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}

<ion-button class="wf-button" expand="block" routerLink="/new-order"><ion-icon slot="start" name="add-outline"></ion-icon>Order fuel</ion-button>

@if(openInvoiceCount()>0||attentionEquipment()){<section class="stack" style="gap:10px">
@if(openInvoiceCount()>0){<ion-card class="wf-card warning-card compact" routerLink="/invoices"><ion-card-content class="row-between alert-row"><div class="row"><ion-icon name="alert-circle-outline"></ion-icon><span>{{openInvoiceCount()}} invoice{{openInvoiceCount()===1?'':'s'}} due · {{openInvoiceTotal()|currency}}</span></div><ion-icon name="chevron-forward-outline"></ion-icon></ion-card-content></ion-card>}
@if(attentionEquipment();as item){<ion-card class="wf-card warning-card compact" [routerLink]="['/equipment-detail',item.id]"><ion-card-content class="row-between alert-row"><div class="row"><ion-icon name="alert-circle-outline"></ion-icon><span>{{item.name}} low · {{item.estimatedLevelPercent||0}}% remaining</span></div><ion-icon name="chevron-forward-outline"></ion-icon></ion-card-content></ion-card>}
</section>}

@if(heroDelivery();as hero){<section><ion-card class="wf-card next-delivery-card"><ion-card-content>
<span class="hero-eyebrow">Next Delivery</span>
<div class="row-between" style="margin-top:6px">
<span class="hero-status-pill"><ion-icon [name]="hero.statusIcon"></ion-icon>{{hero.statusLabel}}</span>
<span class="hero-time-pill">{{heroTimeframe()}}</span>
</div>
<div class="row" style="margin-top:14px"><div class="icon-tile hero-icon"><ion-icon name="car-sport-outline"></ion-icon></div><div class="grow"><strong class="hero-order">{{hero.orderNumber}}</strong><p class="hero-detail">{{hero.dayLabel}}, {{hero.timeLabel}}</p><p class="hero-detail">{{hero.site}}</p><p class="hero-detail">{{hero.gallons}} Gal · {{hero.fuelType}}</p></div></div>
<ion-button class="wf-button hero-track-btn" expand="block" [routerLink]="hero.trackRoute">Track Delivery<ion-icon slot="end" name="chevron-forward-outline"></ion-icon></ion-button>
</ion-card-content></ion-card></section>}

<section><div class="row-between"><h2 class="section-title">Overview</h2><button type="button" class="period-toggle" (click)="cycleStatsPeriod()">{{statsPeriodLabel()}}<ion-icon name="chevron-down-outline"></ion-icon></button></div>
<div class="grid-2">
<ion-card class="wf-card"><ion-card-content class="stat-tile"><div class="icon-tile"><ion-icon name="list-outline"></ion-icon></div><span class="label">Total Orders</span><strong>{{totalOrders()}}</strong>@if(ordersDelta();as d){<span class="stat-delta" [class.up]="d>=0" [class.down]="d<0">{{d>=0?'↑':'↓'}}{{abs(d)}}%</span>}</ion-card-content></ion-card>
<ion-card class="wf-card"><ion-card-content class="stat-tile"><div class="icon-tile"><ion-icon name="water-outline"></ion-icon></div><span class="label">Gallons Ordered</span><strong>{{gallonsOrdered()|number:'1.0-0'}}</strong>@if(gallonsDelta();as d){<span class="stat-delta" [class.up]="d>=0" [class.down]="d<0">{{d>=0?'↑':'↓'}}{{abs(d)}}%</span>}</ion-card-content></ion-card>
<ion-card class="wf-card"><ion-card-content class="stat-tile"><div class="icon-tile"><ion-icon name="cash-outline"></ion-icon></div><span class="label">Amount Spent</span><strong>{{amountSpent()|currency}}</strong>@if(amountDelta();as d){<span class="stat-delta" [class.up]="d>=0" [class.down]="d<0">{{d>=0?'↑':'↓'}}{{abs(d)}}%</span>}</ion-card-content></ion-card>
<ion-card class="wf-card" routerLink="/orders"><ion-card-content class="stat-tile"><div class="icon-tile"><ion-icon name="time-outline"></ion-icon></div><span class="label">Pending Orders</span><strong>{{pendingOrdersCount()}}</strong><span class="stat-link">View details<ion-icon name="chevron-forward-outline"></ion-icon></span></ion-card-content></ion-card>
</div>
</section>

<section><div class="row-between"><h2 class="section-title">Recent Orders</h2><a routerLink="/orders" class="caption">View All</a></div><div class="stack" style="gap:10px">
@for(order of recentOrders();track order.id){<ion-card class="wf-card compact" [routerLink]="['/order-status',order.id]"><ion-card-content class="row-between">
<div><strong>{{order.orderNumber}}</strong><p class="caption" style="margin:4px 0 0">{{order.requestedDate|date:'mediumDate'}} · {{order.deliveryWindow}}</p></div>
<div class="text-right"><strong>{{order.requestedGallons}} Gal</strong><p class="caption" style="margin:4px 0 0">{{order.estimatedTotal|currency}}</p><span class="status-text" [class]="order.statusTone">{{order.statusLabel}}</span></div>
</ion-card-content></ion-card>}
@empty{<ion-card class="wf-card soft-card text-center"><ion-card-content><strong>No orders yet</strong><p class="caption">Place your first fuel order to see it here.</p></ion-card-content></ion-card>}
</div></section>
</main>
</ng-container>}
</wf-customer-shell>`,
styles:[`
  .next-delivery-card{--background:transparent;background:transparent;color:var(--wf-text)}
  .next-delivery-card ion-card-content{color:var(--wf-text)}
  .hero-eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.85}
  .hero-status-pill{display:inline-flex;align-items:center;gap:6px;background:var(--wf-primary-soft);color:var(--wf-primary);padding:6px 10px;border-radius:999px;font-size:12px;font-weight:800}
  .hero-status-pill ion-icon{font-size:15px}
  .hero-time-pill{background:var(--wf-primary-soft);color:var(--wf-primary);padding:6px 10px;border-radius:999px;font-size:12px;font-weight:800;flex:0 0 auto}
  .hero-icon{background:var(--wf-primary-soft);color:var(--wf-primary)}
  .hero-order{font-size:19px;display:block}
  .hero-detail{margin:3px 0 0;font-size:13px;color:var(--wf-muted)}
  .hero-track-btn{margin-top:16px}
  .period-toggle{display:flex;align-items:center;gap:4px;border:0;background:transparent;color:var(--wf-muted);font-size:13px;font-weight:700;cursor:pointer;padding:0}
  .period-toggle ion-icon{font-size:15px}
  .stat-tile{display:grid;gap:8px;align-content:start;min-height:118px}
  .stat-tile .label{font-size:13px;color:var(--wf-muted)}
  .stat-tile strong{font-size:24px;line-height:1}
  .stat-delta{font-size:12px;font-weight:800}
  .stat-delta.up{color:var(--wf-success)}
  .stat-delta.down{color:var(--wf-danger)}
  .stat-link{font-size:12px;font-weight:800;color:var(--wf-primary);display:inline-flex;align-items:center;gap:2px}
  .stat-link ion-icon{font-size:14px}
  .text-right{text-align:right}
  .status-text{display:block;margin-top:4px;font-size:12px;font-weight:800}
  .status-text.info{color:var(--wf-muted)}
  .status-text.success{color:var(--wf-success)}
  .status-text.warning{color:var(--wf-warning)}
  .status-text.danger{color:var(--wf-danger)}
  .alert-row ion-icon:first-child{color:var(--wf-warning);font-size:19px}
`]})
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
  readonly statsPeriod=signal<'month'|'all'>('month');
  readonly abs=Math.abs;
  readonly greeting=computed(()=>{const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';});
  readonly activeJob=computed(()=>this.jobs().find(x=>x.statusGroup==='active')??null);
  readonly nextOrder=computed(()=>{
    const upcoming=this.orders().filter(x=>x.statusGroup!=='delivered'&&x.statusGroup!=='cancelled');
    return upcoming.sort((a,b)=>new Date(a.requestedDate).getTime()-new Date(b.requestedDate).getTime())[0]??null;
  });
  readonly openInvoiceCount=computed(()=>this.invoices().filter(x=>x.isOpen).length);
  readonly openInvoiceTotal=computed(()=>this.invoices().filter(x=>x.isOpen).reduce((sum,x)=>sum+x.total,0));
  readonly attentionEquipment=computed(()=>this.equipment().find(x=>x.isActive&&Number(x.estimatedLevelPercent??0)<=35)??null);
  readonly recentOrders=computed(()=>[...this.orders()].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,5));

  readonly heroDelivery=computed<HeroDelivery|null>(()=>{
    const job=this.activeJob();
    if(job){return {orderNumber:job.jobNumber,dayLabel:this.formatDay(job.scheduledAt),timeLabel:this.formatTime(job.scheduledAt),site:job.siteName,gallons:job.targetGallons,fuelType:job.fuelType,trackRoute:['/live-tracking',job.id],scheduledAt:job.scheduledAt,statusLabel:job.statusLabel,statusIcon:deliveryStatusIcon(job.status)};}
    const order=this.nextOrder();
    if(order){const scheduledAt=this.composeOrderDateTime(order);return {orderNumber:order.orderNumber,dayLabel:this.formatDay(order.requestedDate),timeLabel:order.deliveryWindow,site:order.siteName,gallons:order.requestedGallons,fuelType:order.fuelType,trackRoute:['/order-status',order.id],scheduledAt,statusLabel:order.statusLabel,statusIcon:deliveryStatusIcon(order.status)};}
    return null;
  });
  readonly heroTimeframe=computed(()=>{
    const hero=this.heroDelivery();
    if(!hero)return '';
    const target=new Date(hero.scheduledAt);
    if(Number.isNaN(target.getTime()))return '';
    const now=new Date();
    const diffMs=target.getTime()-now.getTime();
    if(diffMs<=0)return 'Now';
    const diffHours=diffMs/3600000;
    if(diffHours<=6){
      const totalMin=Math.round(diffMs/60000);
      if(totalMin<60)return `In ${totalMin} Minute${totalMin===1?'':'s'}`;
      const hrs=Math.round(diffMs/3600000);
      return `In ${hrs} Hour${hrs===1?'':'s'}`;
    }
    if(target.toDateString()===now.toDateString())return 'Today';
    const tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);
    if(target.toDateString()===tomorrow.toDateString())return 'Tomorrow';
    return target.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
  });

  readonly currentMonthOrders=computed(()=>this.ordersInMonth(0));
  readonly previousMonthOrders=computed(()=>this.ordersInMonth(1));
  readonly statsOrders=computed(()=>this.statsPeriod()==='month'?this.currentMonthOrders():this.orders());
  readonly statsPeriodLabel=computed(()=>this.statsPeriod()==='month'?'This Month':'All Time');
  readonly totalOrders=computed(()=>this.statsOrders().length);
  readonly gallonsOrdered=computed(()=>this.sumGallons(this.statsOrders()));
  readonly amountSpent=computed(()=>this.sumAmount(this.statsOrders()));
  readonly pendingOrdersCount=computed(()=>this.statsOrders().filter(x=>x.statusGroup!=='delivered'&&x.statusGroup!=='cancelled').length);
  readonly ordersDelta=computed<number|null>(()=>this.statsPeriod()==='month'?this.percentChange(this.currentMonthOrders().length,this.previousMonthOrders().length):null);
  readonly gallonsDelta=computed<number|null>(()=>this.statsPeriod()==='month'?this.percentChange(this.sumGallons(this.currentMonthOrders()),this.sumGallons(this.previousMonthOrders())):null);
  readonly amountDelta=computed<number|null>(()=>this.statsPeriod()==='month'?this.percentChange(this.sumAmount(this.currentMonthOrders()),this.sumAmount(this.previousMonthOrders())):null);

  cycleStatsPeriod():void{this.statsPeriod.update(p=>p==='month'?'all':'month');}
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

  private ordersInMonth(monthsAgo:number):CustomerOrder[]{
    const now=new Date();
    const y=now.getFullYear();const m=now.getMonth()-monthsAgo;
    return this.orders().filter(o=>{const d=new Date(o.createdAt);return d.getFullYear()===new Date(y,m,1).getFullYear()&&d.getMonth()===new Date(y,m,1).getMonth();});
  }
  private sumGallons(list:CustomerOrder[]):number{return list.reduce((sum,x)=>sum+x.requestedGallons,0);}
  private sumAmount(list:CustomerOrder[]):number{return list.reduce((sum,x)=>sum+x.estimatedTotal,0);}
  private percentChange(current:number,previous:number):number{if(previous<=0)return current>0?100:0;return Math.round(((current-previous)/previous)*100);}
  private formatDay(iso:string):string{
    const d=new Date(iso);
    if(Number.isNaN(d.getTime()))return '';
    return d.toDateString()===new Date().toDateString()?'Today':d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
  }
  private formatTime(iso:string):string{
    const d=new Date(iso);
    return Number.isNaN(d.getTime())?'':d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
  }
  private parseWindowStart(windowText:string):{h:number;m:number}|null{
    const match=windowText?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if(!match)return null;
    let h=parseInt(match[1],10);const m=parseInt(match[2],10);const ap=match[3].toUpperCase();
    if(ap==='PM'&&h!==12)h+=12;if(ap==='AM'&&h===12)h=0;
    return {h,m};
  }
  private composeOrderDateTime(order:CustomerOrder):string{
    const start=this.parseWindowStart(order.deliveryWindow);
    const date=new Date(order.requestedDate);
    if(start&&!Number.isNaN(date.getTime())){date.setHours(start.h,start.m,0,0);return date.toISOString();}
    return order.requestedDate;
  }
}
