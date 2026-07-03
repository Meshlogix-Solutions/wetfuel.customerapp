import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { EQUIPMENT } from '../data/mock-data';
@Component({ selector:'app-equipment', standalone:true, imports:[CommonModule, RouterLink, IonicModule, MobileShellComponent], template:`
<wf-customer-shell title="Equipment" subtitle="3 registered assets" [showNav]="true"><main class="screen-body stack"><ion-searchbar placeholder="Search equipment"></ion-searchbar><ion-button class="wf-button" expand="block" routerLink="/equipment-form"><ion-icon slot="start" name="add-outline"></ion-icon>Add equipment</ion-button><ion-card *ngFor="let item of equipment" class="wf-card" routerLink="/equipment-detail"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="cube-outline"></ion-icon></div><div class="grow"><div class="row-between"><strong>{{item.name}}</strong><span class="pill" [class.warning]="item.current<50" [class.success]="item.current>=50">{{item.current}}%</span></div><p class="caption">{{item.id}} · {{item.location}}</p><div class="equipment-level"><span [style.width.%]="item.current"></span></div><p class="caption" style="margin-bottom:0">{{item.fuel}} · {{item.capacity}} gal</p></div><ion-icon name="chevron-forward-outline"></ion-icon></div></ion-card-content></ion-card></main></wf-customer-shell>` })
export class EquipmentPage { readonly equipment=EQUIPMENT; }
