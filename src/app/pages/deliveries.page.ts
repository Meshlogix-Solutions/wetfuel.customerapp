import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { ORDERS } from '../data/mock-data';
@Component({ selector:'app-deliveries', standalone:true, imports:[CommonModule, RouterLink, IonicModule, MobileShellComponent], template:`
<wf-customer-shell title="Delivery history" subtitle="Completed fueling records" backRoute="/home"><main class="screen-body stack"><ion-searchbar placeholder="Search deliveries"></ion-searchbar><ion-card *ngFor="let order of deliveries" class="wf-card" routerLink="/delivery-detail"><ion-card-content><div class="row-between"><span class="pill success">Completed</span><strong>{{order.id}}</strong></div><h3>{{order.location}}</h3><p class="caption">{{order.equipment}}</p><div class="detail-row"><span>{{order.date}} · {{order.time}}</span><strong>{{order.gallons}} gal</strong></div><div class="row-between" style="padding-top:10px"><span class="caption">{{order.fuel}}</span><strong>{{order.total | currency}}</strong></div></ion-card-content></ion-card></main></wf-customer-shell>` })
export class DeliveriesPage { readonly deliveries=ORDERS.filter(x=>x.status==='Completed'); }
