import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { CustomerAuthService } from '../services/customer-auth.service';
import { CustomerStateService } from '../services/customer-state.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
@Component({selector:'app-profile',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,IonItem,IonLabel,IonList,MobileShellComponent],template:`
<wf-customer-shell title="Account" [subtitle]="state.profile()?.companyName || 'Customer'" [showNav]="true"><main class="screen-body stack">
<ion-card class="wf-card"><ion-card-content class="row"><div class="avatar">{{initials()}}</div><div class="grow"><h2 style="margin:0 0 4px">{{state.profile()?.contactName || 'Customer'}}</h2><p class="caption" style="margin:0">{{state.profile()?.contactEmail}}</p></div></ion-card-content></ion-card>
<ion-list inset="true"><ion-item button routerLink="/locations"><ion-icon name="location-outline" slot="start"></ion-icon><ion-label><h3>Delivery locations</h3><p>{{state.sites().length}} saved</p></ion-label></ion-item><ion-item button routerLink="/invoices"><ion-icon name="document-text-outline" slot="start"></ion-icon><ion-label>Billing and invoices</ion-label></ion-item><ion-item><ion-icon name="card-outline" slot="start"></ion-icon><ion-label><h3>Billing terms</h3><p>{{state.profile()?.billingTerm || '—'}}</p></ion-label></ion-item><ion-item button routerLink="/notifications"><ion-icon name="notifications-outline" slot="start"></ion-icon><ion-label>Notification preferences</ion-label></ion-item><ion-item button routerLink="/support"><ion-icon name="help-circle-outline" slot="start"></ion-icon><ion-label>Help and support</ion-label></ion-item></ion-list>
<ion-card class="wf-card"><ion-card-content><div class="detail-row"><span>Account status</span><strong>{{state.profile()?.status || '—'}}</strong></div><div class="detail-row"><span>Customer ID</span><strong>{{state.profile()?.id || '—'}}</strong></div></ion-card-content></ion-card>
<ion-button class="wf-button wf-secondary" expand="block" (click)="logout()"><ion-icon name="log-out-outline" slot="start"></ion-icon>Sign out</ion-button><p class="caption text-center">WetFuel Customer v1.0.0</p>
</main></wf-customer-shell>`})
export class ProfilePage{
  readonly state=inject(CustomerStateService);private readonly auth=inject(CustomerAuthService);
  readonly initials=computed(()=>{const p=this.state.profile();return `${p?.contactFirstName?.[0]??''}${p?.contactLastName?.[0]??''}`.toUpperCase()||'CU';});
  logout():void{void this.auth.logout();}
}
