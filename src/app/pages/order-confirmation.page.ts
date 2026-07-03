import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { CustomerStateService } from '../services/customer-state.service';
@Component({ selector:'app-order-confirmation', standalone:true, imports:[CommonModule, RouterLink, IonicModule, MobileShellComponent], template:`
<wf-customer-shell title="Order confirmed" subtitle="WetFuel" [showSupport]="false"><main class="screen-body stack text-center"><div class="success-orb"><ion-icon name="checkmark-circle-outline"></ion-icon></div><div><h2 style="margin-bottom:8px">Your fuel order is in</h2><p class="page-lead">Order <strong>WF-78401</strong> has been sent to WetFuel Dallas North for scheduling.</p></div><ion-card class="wf-card"><ion-card-content><div class="detail-row"><span>Delivery date</span><strong>{{state.deliveryDate()}}</strong></div><div class="detail-row"><span>Time preference</span><strong>{{state.deliveryWindow()}}</strong></div><div class="detail-row"><span>Requested volume</span><strong>{{state.gallons()}} gal</strong></div><div class="detail-row"><span>Location</span><strong>{{state.selectedLocation().name}}</strong></div></ion-card-content></ion-card><ion-button class="wf-button" expand="block" routerLink="/orders">View my orders</ion-button><ion-button class="wf-button wf-secondary" expand="block" routerLink="/home">Return home</ion-button></main></wf-customer-shell>` })
export class OrderConfirmationPage { constructor(readonly state:CustomerStateService){} }
