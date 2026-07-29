import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { CustomerNotificationService } from '../services/customer-notification.service';

@Component({ selector:'app-notifications', standalone:true, imports:[CommonModule, RouterLink, IonButton, IonCard, IonCardContent, IonIcon, MobileShellComponent], template:`
<wf-customer-shell title="Notifications" [subtitle]="notifications.items().length + ' active'" backRoute="/home" [showNav]="true"><main class="screen-body stack">
<div class="row-between"><h2 class="section-title" style="margin:0">Updates and alerts</h2><ion-button fill="clear" size="small" [disabled]="notifications.unreadCount()===0" (click)="notifications.markAllRead()">Mark all read</ion-button></div>
<ion-card *ngFor="let item of notifications.items()" class="wf-card" [routerLink]="item.route||null"><ion-card-content class="row"><div class="icon-tile"><ion-icon [name]="item.kind==='delivery'?'truck-outline':'cube-outline'"></ion-icon></div><div class="grow"><strong>{{item.title}}</strong><p class="caption" style="margin:4px 0 0">{{item.detail}}</p></div><span *ngIf="item.unread" class="status-dot"></span></ion-card-content></ion-card>
<ion-card *ngIf="notifications.items().length===0" class="wf-card soft-card text-center"><ion-card-content><strong>Nothing needs attention</strong><p class="caption">Delivery updates and equipment alerts will appear here.</p></ion-card-content></ion-card>
</main></wf-customer-shell>` })
export class NotificationsPage {
  readonly notifications = inject(CustomerNotificationService);
  async ionViewWillEnter(): Promise<void> {
    await this.notifications.refresh();
    this.notifications.markAllRead();
  }
}
