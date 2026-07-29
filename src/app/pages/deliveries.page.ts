import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardContent, IonIcon, IonSearchbar } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerJob } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';

@Component({
  selector:'app-deliveries', standalone:true,
  imports:[CommonModule, FormsModule, RouterLink, IonCard, IonCardContent, IonIcon, IonSearchbar, MobileShellComponent, LoaderComponent],
  template:`<wf-customer-shell title="Delivery history" subtitle="Completed fueling records" backRoute="/home" [showNav]="true">
    @if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading deliveries..." /></section>}
    @else{<main class="screen-body stack">
      @if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
      <ion-searchbar placeholder="Search customer, site, job or equipment" [ngModel]="search()" (ngModelChange)="search.set($event)"></ion-searchbar>
      @for(job of deliveries();track job.id){
        <ion-card class="wf-card" [routerLink]="['/delivery-detail',job.id]"><ion-card-content>
          <div class="row-between"><span class="pill success">Completed</span><strong>{{job.jobNumber}}</strong></div>
          <h3>{{job.siteName}}</h3><p class="caption">{{job.equipmentName||'Equipment'}}</p>
          <div class="detail-row"><span>{{job.completedAt|date:'medium'}}</span><strong>{{job.deliveredGallons??job.targetGallons}} gal</strong></div>
          <div class="row-between" style="padding-top:10px"><span class="caption">{{job.fuelType}}</span><span class="caption">{{job.driverName}}</span></div>
        </ion-card-content></ion-card>
      }@empty{<ion-card class="wf-card soft-card text-center"><ion-card-content><div class="icon-tile" style="margin:0 auto 10px"><ion-icon name="checkmark-done-outline"></ion-icon></div><strong>No completed deliveries found</strong><p class="caption">Completed fuel deliveries will show up here.</p></ion-card-content></ion-card>}
    </main>}
  </wf-customer-shell>`
})
export class DeliveriesPage {
  private readonly api=inject(CustomerApiService);
  readonly jobs=signal<CustomerJob[]>([]);
  readonly search=signal('');
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  readonly deliveries=computed(()=>{
    const term=this.search().trim().toLowerCase();
    return this.jobs().filter(x=>x.status==='completed').filter(x=>!term||[x.jobNumber,x.siteName,x.equipmentName,x.driverName].some(v=>v?.toLowerCase().includes(term)));
  });
  ionViewWillEnter():void{this.load();}
  load():void{
    this.loading.set(true);this.error.set('');
    this.api.getJobs().subscribe({
      next:rows=>{this.jobs.set(rows);this.hasLoaded.set(true);this.loading.set(false);},
      error:()=>{this.error.set('Delivery history could not be loaded. Check your connection and try again.');this.loading.set(false);},
    });
  }
}
