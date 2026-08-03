import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { CustomerApiService, CustomerProfile } from '../services/customer-api.service';
import { CustomerAuthService } from '../services/customer-auth.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';
@Component({selector:'app-profile',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,IonItem,IonLabel,IonList,MobileShellComponent,LoaderComponent],template:`
<wf-customer-shell title="Settings" [subtitle]="profile()?.companyName || 'Customer'" [showNav]="true">
@if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading account..." /></section>}
@else{<main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
<ion-card class="wf-card"><ion-card-content class="row"><div class="avatar">{{initials()}}</div><div class="grow"><h2 style="margin:0 0 4px">{{profile()?.contactName || 'Customer'}}</h2><p class="caption" style="margin:0">{{profile()?.contactEmail}}</p></div><span class="status-pill" [class.success]="profile()?.isActive" [class.danger]="!profile()?.isActive">{{profile()?.statusLabel}}</span></ion-card-content></ion-card>
<ion-card class="wf-card"><ion-card-content>
<div class="detail-row"><span>Company</span><strong>{{profile()?.companyName || '—'}}</strong></div>
<div class="detail-row"><span>Contact name</span><strong>{{profile()?.contactName || '—'}}</strong></div>
<div class="detail-row"><span>Email</span><strong>{{profile()?.contactEmail || '—'}}</strong></div>
<div class="detail-row"><span>Phone</span><strong>{{profile()?.contactPhone || '—'}}</strong></div>
<div class="detail-row"><span>Billing terms</span><strong>{{profile()?.billingTerm || '—'}}</strong></div>
</ion-card-content></ion-card>
<ion-list inset="true"><ion-item button routerLink="/locations"><ion-icon name="business-outline" slot="start"></ion-icon><ion-label><h3>Sites</h3><p>{{siteCount()}} saved</p></ion-label></ion-item><ion-item button routerLink="/invoices"><ion-icon name="wallet-outline" slot="start"></ion-icon><ion-label>Payments</ion-label></ion-item><ion-item button routerLink="/notifications"><ion-icon name="notifications-outline" slot="start"></ion-icon><ion-label>Notification preferences</ion-label></ion-item></ion-list>
<ion-button class="wf-button wf-secondary" expand="block" (click)="logout()"><ion-icon name="log-out-outline" slot="start"></ion-icon>Sign out</ion-button><p class="caption text-center">WetFuel Customer v1.0.0</p>
</main>}
</wf-customer-shell>`,
styles:[`
  .status-pill{flex:0 0 auto;font-size:11px;font-weight:800;padding:5px 10px;border-radius:999px}
  .status-pill.success{color:var(--wf-success);background:color-mix(in srgb, var(--wf-success) 15%, transparent)}
  .status-pill.danger{color:var(--wf-danger);background:color-mix(in srgb, var(--wf-danger) 15%, transparent)}
`]})
export class ProfilePage{
  private readonly api=inject(CustomerApiService);
  private readonly auth=inject(CustomerAuthService);
  readonly profile=signal<CustomerProfile|null>(null);
  readonly siteCount=signal(0);
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  readonly initials=computed(()=>{const p=this.profile();return `${p?.contactFirstName?.[0]??''}${p?.contactLastName?.[0]??''}`.toUpperCase()||'CU';});
  ionViewWillEnter():void{this.load();}
  load():void{
    this.loading.set(true);this.error.set('');
    Promise.all([firstValueFrom(this.api.getCurrentCustomer()),firstValueFrom(this.api.getSites())]).then(([profile,sites])=>{
      this.profile.set(profile);this.siteCount.set(sites.length);this.hasLoaded.set(true);this.loading.set(false);
    }).catch(()=>{
      this.error.set('Your account could not be loaded. Check your connection and try again.');this.loading.set(false);
    });
  }
  logout():void{void this.auth.logout();}
}
