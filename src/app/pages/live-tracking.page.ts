import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({ selector:'app-live-tracking', standalone:true, imports:[CommonModule, IonicModule, MobileShellComponent], template:`
<wf-customer-shell title="Live tracking" subtitle="Order WF-78312" backRoute="/order-status"><main class="screen-body stack"><div class="map-mock"><div class="route-line"></div><div class="map-pin driver-pin" style="left:28%;top:55%"><span>🚚</span></div><div class="map-pin" style="right:18%;top:20%"><span>●</span></div></div><ion-card class="wf-card"><ion-card-content><div class="row-between"><div><span class="pill info">Driver en route</span><h2 style="margin:12px 0 4px">Dave is 24 min away</h2><p class="caption">7.8 miles · ETA 10:48 AM</p></div><div class="avatar">DM</div></div><hr class="divider"><div class="row-between"><div><strong>Truck WF-27</strong><p class="caption">WetFuel Dallas North</p></div><ion-button fill="outline" shape="round"><ion-icon name="call-outline"></ion-icon></ion-button></div></ion-card-content></ion-card><ion-card class="wf-card soft-card"><ion-card-content class="row"><ion-icon name="information-circle-outline" style="font-size:24px"></ion-icon><p class="caption" style="margin:0">Tracking updates while the driver is actively traveling to your site. Location may be delayed in weak coverage areas.</p></ion-card-content></ion-card></main></wf-customer-shell>` })
export class LiveTrackingPage {  }
