import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LOCATIONS, EQUIPMENT } from '../data/mock-data';
@Component({ selector:'app-locations', standalone:true, imports:[CommonModule, RouterLink, IonButton, IonCard, IonCardContent, IonIcon, MobileShellComponent], template:`
<wf-customer-shell title="Locations" subtitle="Delivery sites" backRoute="/profile"><main class="screen-body stack"><ion-button class="wf-button" expand="block" routerLink="/location-form"><ion-icon name="add-outline" slot="start"></ion-icon>Add delivery location</ion-button><ion-card *ngFor="let location of locations" class="wf-card"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="business-outline"></ion-icon></div><div class="grow"><div class="row wrap"><strong>{{location.name}}</strong><span *ngIf="location.primary" class="pill success">Primary</span></div><p class="caption">{{location.address}}</p><span class="caption">{{equipmentCount(location.name)}} registered equipment</span></div><ion-button fill="clear" routerLink="/location-form"><ion-icon name="pencil-outline"></ion-icon></ion-button></div></ion-card-content></ion-card></main></wf-customer-shell>` })
export class LocationsPage { readonly locations=LOCATIONS; equipmentCount(name:string){return EQUIPMENT.filter(x=>x.location===name).length;} }
