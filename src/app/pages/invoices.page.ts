import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardContent, IonIcon, IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';
import { CustomerApiService, CustomerInvoice } from '../services/customer-api.service';
@Component({ selector:'app-invoices', standalone:true, imports:[CommonModule, FormsModule, RouterLink, IonCard, IonCardContent, IonIcon, IonLabel, IonSegment, IonSegmentButton, MobileShellComponent, LoaderComponent], template:`
<wf-customer-shell title="Payments" subtitle="Billing and payment history" [showNav]="true">
@if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading invoices..." /></section>}
@else{<main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
<ion-card class="wf-card hero-card"><ion-card-content><span class="pill dark">Current balance</span><h2 style="font-size:36px;margin:14px 0 4px">{{outstandingTotal()|currency}}</h2><p class="caption" style="margin:0">{{openCount()}} open invoice{{openCount()===1?'':'s'}}</p></ion-card-content></ion-card>
<ion-segment [ngModel]="filter()" (ngModelChange)="filter.set($event)"><ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button><ion-segment-button value="open"><ion-label>Open</ion-label></ion-segment-button><ion-segment-button value="paid"><ion-label>Paid</ion-label></ion-segment-button></ion-segment>
@for(invoice of visibleInvoices();track invoice.id){<ion-card class="wf-card" [routerLink]="['/invoice-detail',invoice.id]"><ion-card-content><div class="row-between"><span class="pill" [ngClass]="invoice.statusTone || 'info'">{{invoice.statusLabel || invoice.status}}</span><strong>{{invoice.invoiceNumber}}</strong></div><h2>{{invoice.total|currency}}</h2><p class="caption">{{invoice.lineItems.length}} deliver{{invoice.lineItems.length===1?'y':'ies'}}</p><div class="detail-row"><span>Issued {{invoice.issueDate|date:'mediumDate'}}</span><strong>Due {{invoice.dueDate|date:'mediumDate'}}</strong></div></ion-card-content></ion-card>}
@empty{<ion-card class="wf-card soft-card text-center"><ion-card-content><div class="icon-tile" style="margin:0 auto 10px"><ion-icon name="document-text-outline"></ion-icon></div><strong>No invoices in this view</strong><p class="caption">Invoices are created once a delivery is billed.</p></ion-card-content></ion-card>}
</main>}
</wf-customer-shell>` })
export class InvoicesPage {
  private readonly api=inject(CustomerApiService);
  readonly invoices=signal<CustomerInvoice[]>([]);
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  readonly filter=signal('all');
  readonly outstandingTotal=computed(()=>this.invoices().filter(x=>x.isOpen).reduce((sum,x)=>sum+x.total,0));
  readonly openCount=computed(()=>this.invoices().filter(x=>x.isOpen).length);
  readonly visibleInvoices=computed(()=>{
    const rows=this.invoices();
    const f=this.filter();
    if(f==='open')return rows.filter(x=>x.isOpen);
    if(f==='paid')return rows.filter(x=>x.status==='paid');
    return rows;
  });
  ionViewWillEnter():void{this.load();}
  load():void{
    this.loading.set(true);this.error.set('');
    this.api.getInvoices().subscribe({
      next:rows=>{this.invoices.set(rows);this.hasLoaded.set(true);this.loading.set(false);},
      error:()=>{this.error.set('Invoices could not be loaded. Check your connection and try again.');this.loading.set(false);},
    });
  }
}
