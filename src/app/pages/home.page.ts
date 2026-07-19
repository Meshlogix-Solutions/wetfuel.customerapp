import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { CustomerStateService } from '../services/customer-state.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({selector:'app-home',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,MobileShellComponent],template:`
<wf-customer-shell [title]="'Good morning, ' + (state.profile()?.contactFirstName || 'there')" [subtitle]="state.profile()?.companyName || 'Customer account'" [showNav]="true"><main class="screen-body stack">
@if(activeJob();as job){<ion-card class="wf-card hero-card"><ion-card-content><div class="row-between"><div><span class="pill dark">{{statusLabel(job.status)}}</span><h2 style="margin:16px 0 5px">{{job.siteName}}</h2><p style="margin:0;opacity:.75">{{job.jobNumber}} · {{job.scheduledAt|date:'medium'}}</p></div><div class="icon-tile" style="background:rgba(255,255,255,.14);color:#fff"><ion-icon name="truck-outline"></ion-icon></div></div><div style="height:16px"></div><ion-button class="wf-button" color="tertiary" expand="block" [routerLink]="['/live-tracking',job.id]">View delivery status</ion-button></ion-card-content></ion-card>}
<ion-button class="wf-button" expand="block" routerLink="/new-order"><ion-icon slot="start" name="add-outline"></ion-icon>Order fuel</ion-button>
<section class="grid-3"><ion-card class="wf-card" routerLink="/orders"><ion-card-content class="metric"><span class="label">Active orders</span><strong>{{activeOrderCount()}}</strong><span class="caption">View status</span></ion-card-content></ion-card><ion-card class="wf-card" routerLink="/equipment"><ion-card-content class="metric"><span class="label">Equipment</span><strong>{{state.equipment().length}}</strong><span class="caption">{{attentionCount()}} need attention</span></ion-card-content></ion-card><ion-card class="wf-card" routerLink="/deliveries"><ion-card-content class="metric"><span class="label">Deliveries</span><strong>{{completedCount()}}</strong><span class="caption">Completed</span></ion-card-content></ion-card></section>
@if(attentionEquipment();as item){<section><div class="row-between"><h2 class="section-title">Equipment attention</h2><a routerLink="/equipment" class="caption">View all</a></div><ion-card class="wf-card warning-card" [routerLink]="['/equipment-detail',item.id]"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="cube-outline"></ion-icon></div><div class="grow"><strong>{{item.name}}</strong><p class="caption" style="margin:5px 0 9px">{{item.location}} · estimated {{item.current}}% remaining</p><div class="equipment-level"><span [style.width.%]="item.current"></span></div></div><ion-icon name="chevron-forward-outline"></ion-icon></div></ion-card-content></ion-card></section>}
<section><h2 class="section-title">Quick access</h2><div class="grid-2"><ion-card class="wf-card" routerLink="/invoices"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="document-text-outline"></ion-icon></div><strong>Invoices</strong></ion-card-content></ion-card><ion-card class="wf-card" routerLink="/deliveries"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="receipt-outline"></ion-icon></div><strong>Delivery history</strong></ion-card-content></ion-card><ion-card class="wf-card" routerLink="/locations"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="location-outline"></ion-icon></div><strong>Locations</strong></ion-card-content></ion-card><ion-card class="wf-card" routerLink="/support"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="help-circle-outline"></ion-icon></div><strong>Get support</strong></ion-card-content></ion-card></div></section>
</main></wf-customer-shell>`})
export class HomePage {
  readonly state=inject(CustomerStateService);
  readonly activeJob=computed(()=>this.state.jobs().find(x=>!['completed','cancelled'].includes(x.status))??null);
  readonly activeOrderCount=computed(()=>this.state.orders().filter(x=>!['completed','cancelled'].includes(x.status)).length);
  readonly completedCount=computed(()=>this.state.jobs().filter(x=>x.status==='completed').length);
  readonly attentionCount=computed(()=>this.state.equipment().filter(x=>x.status==='active'&&Number(x.current)<=35).length);
  readonly attentionEquipment=computed(()=>this.state.equipment().find(x=>x.status==='active'&&Number(x.current)<=35)??null);
  statusLabel(value:string):string{return value.replace(/_/g,' ').replace(/\b\w/g,x=>x.toUpperCase());}
  ionViewWillEnter():void{void this.state.refresh().catch(()=>undefined);}
}
