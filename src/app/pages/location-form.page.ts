import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonInput, IonItem, IonTextarea, IonToggle } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({ selector:'app-location-form', standalone:true, imports:[CommonModule, RouterLink, IonButton, IonCard, IonCardContent, IonInput, IonItem, IonTextarea, IonToggle, MobileShellComponent], template:`
<wf-customer-shell title="Add location" subtitle="Delivery site" backRoute="/locations"><main class="screen-body stack"><ion-card class="wf-card form-card"><ion-card-content class="stack"><ion-item><ion-input label="Location name" labelPlacement="stacked" placeholder="e.g. South Distribution Center"></ion-input></ion-item><ion-item><ion-input label="Street address" labelPlacement="stacked"></ion-input></ion-item><div class="grid-2"><ion-item><ion-input label="City" labelPlacement="stacked"></ion-input></ion-item><ion-item><ion-input label="ZIP code" labelPlacement="stacked"></ion-input></ion-item></div><ion-item><ion-input label="On-site contact" labelPlacement="stacked"></ion-input></ion-item><ion-item><ion-input label="Contact phone" labelPlacement="stacked" type="tel"></ion-input></ion-item><ion-item><ion-textarea label="Driver access instructions" labelPlacement="stacked" autoGrow="true"></ion-textarea></ion-item><ion-toggle>Make this my primary location</ion-toggle></ion-card-content></ion-card><div class="map-mock" style="min-height:180px"><div class="map-pin" style="left:46%;top:34%"><span>●</span></div></div><ion-button class="wf-button" expand="block" routerLink="/locations">Save location</ion-button></main></wf-customer-shell>` })
export class LocationFormPage {  }
