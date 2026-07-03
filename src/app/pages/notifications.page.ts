import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({ selector:'app-notifications', standalone:true, imports:[CommonModule, IonicModule, MobileShellComponent], template:`
<wf-customer-shell title="Notifications" subtitle="Updates and alerts" backRoute="/home"><main class="screen-body stack"><ion-card class="wf-card soft-card"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="truck-outline"></ion-icon></div><div class="grow"><strong>Driver is on the way</strong><p class="caption">Dave left the depot. Estimated arrival is 10:48 AM.</p><span class="caption">8 minutes ago</span></div></ion-card-content></ion-card><ion-card class="wf-card"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="calendar-outline"></ion-icon></div><div class="grow"><strong>Order scheduled</strong><p class="caption">Order WF-78196 is scheduled for July 8, 8:00–10:00 AM.</p><span class="caption">Yesterday</span></div></ion-card-content></ion-card><ion-card class="wf-card warning-card"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="warning-outline"></ion-icon></div><div class="grow"><strong>Equipment may need fuel</strong><p class="caption">Backup Generator Tank is estimated at 32% remaining.</p><span class="caption">July 1</span></div></ion-card-content></ion-card><ion-card class="wf-card"><ion-card-content class="row"><div class="icon-tile"><ion-icon name="document-text-outline"></ion-icon></div><div class="grow"><strong>New invoice available</strong><p class="caption">Invoice INV-10482 for $1,610.70 is now available.</p><span class="caption">June 24</span></div></ion-card-content></ion-card></main></wf-customer-shell>` })
export class NotificationsPage {  }
