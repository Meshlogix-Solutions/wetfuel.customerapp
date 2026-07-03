import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { EQUIPMENT } from '../data/mock-data';
import { CustomerStateService } from '../services/customer-state.service';
@Component({ selector:'app-select-equipment', standalone:true, imports:[CommonModule, RouterLink, IonicModule, MobileShellComponent], template:`
<wf-customer-shell title="Select equipment" subtitle="Order fuel" backRoute="/new-order"><main class="screen-body stack"><ion-searchbar placeholder="Search equipment"></ion-searchbar><ion-card *ngFor="let item of equipment" class="wf-card selection-card" [class.selected]="state.selectedEquipment().id===item.id" (click)="state.setEquipment(item.id)"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="cube-outline"></ion-icon></div><div class="grow"><div class="row-between"><strong>{{item.name}}</strong><span class="pill" [class.warning]="item.current<50" [class.success]="item.current>=50">{{item.current}}%</span></div><p class="caption">{{item.id}} · {{item.location}}</p><div class="equipment-level"><span [style.width.%]="item.current"></span></div><p class="caption" style="margin-bottom:0">{{item.fuel}} · {{item.capacity}} gal capacity</p></div><ion-icon *ngIf="state.selectedEquipment().id===item.id" name="checkmark-circle-outline" style="font-size:28px;color:var(--wf-teal)"></ion-icon></div></ion-card-content></ion-card><ion-button class="wf-button" expand="block" routerLink="/new-order">Use selected equipment</ion-button></main></wf-customer-shell>` })
export class SelectEquipmentPage { readonly equipment=EQUIPMENT; constructor(readonly state:CustomerStateService){} }
