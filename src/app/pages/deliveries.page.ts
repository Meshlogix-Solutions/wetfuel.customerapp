import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardContent, IonSearchbar } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerJob } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({
  selector:'app-deliveries', standalone:true,
  imports:[CommonModule, FormsModule, RouterLink, IonCard, IonCardContent, IonSearchbar, MobileShellComponent],
  template:`<wf-customer-shell title="Delivery history" subtitle="Completed fueling records" backRoute="/home">
    <main class="screen-body stack">
      <ion-searchbar placeholder="Search customer, site, job or equipment" [ngModel]="search()" (ngModelChange)="search.set($event)"></ion-searchbar>
      @for(job of deliveries();track job.id){
        <ion-card class="wf-card" [routerLink]="['/delivery-detail',job.id]"><ion-card-content>
          <div class="row-between"><span class="pill success">Completed</span><strong>{{job.jobNumber}}</strong></div>
          <h3>{{job.siteName}}</h3><p class="caption">{{job.equipmentName||'Equipment'}}</p>
          <div class="detail-row"><span>{{job.completedAt|date:'medium'}}</span><strong>{{job.deliveredGallons??job.targetGallons}} gal</strong></div>
          <div class="row-between" style="padding-top:10px"><span class="caption">{{job.fuelType}}</span><span class="caption">{{job.driverName}}</span></div>
        </ion-card-content></ion-card>
      }@empty{<ion-card class="wf-card"><ion-card-content>No completed deliveries found.</ion-card-content></ion-card>}
    </main>
  </wf-customer-shell>`
})
export class DeliveriesPage {
  private readonly api=inject(CustomerApiService);
  readonly jobs=signal<CustomerJob[]>([]);
  readonly search=signal('');
  readonly deliveries=computed(()=>{
    const term=this.search().trim().toLowerCase();
    return this.jobs().filter(x=>x.status==='completed').filter(x=>!term||[x.jobNumber,x.siteName,x.equipmentName,x.driverName].some(v=>v?.toLowerCase().includes(term)));
  });
  ionViewWillEnter():void{this.api.getJobs().subscribe({next:rows=>this.jobs.set(rows)});}
}
