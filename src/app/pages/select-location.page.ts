import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LOCATIONS } from '../data/mock-data';
import { CustomerStateService } from '../services/customer-state.service';
@Component({ selector:'app-select-location', standalone:true, imports:[CommonModule, RouterLink, IonicModule, MobileShellComponent], template:`
<wf-customer-shell title="Select location" subtitle="Order fuel" backRoute="/new-order"><main class="screen-body stack"><ion-searchbar placeholder="Search locations"></ion-searchbar><ion-card *ngFor="let location of locations" class="wf-card selection-card" [class.selected]="state.selectedLocation().id===location.id" (click)="state.setLocation(location.id)"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="business-outline"></ion-icon></div><div class="grow"><div class="row wrap"><strong>{{location.name}}</strong><span *ngIf="location.primary" class="pill success">Primary</span></div><p class="caption">{{location.address}}</p><span class="caption">{{location.distance}} from dispatch depot</span></div><ion-icon *ngIf="state.selectedLocation().id===location.id" name="checkmark-circle-outline" style="font-size:28px;color:var(--wf-teal)"></ion-icon></div></ion-card-content></ion-card><ion-button class="wf-button" expand="block" routerLink="/new-order">Use selected location</ion-button><ion-button class="wf-button wf-secondary" expand="block" routerLink="/location-form"><ion-icon name="add-outline" slot="start"></ion-icon>Add a location</ion-button></main></wf-customer-shell>` })
export class SelectLocationPage { readonly locations=LOCATIONS; constructor(readonly state:CustomerStateService){} }
