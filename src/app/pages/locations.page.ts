import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerSite } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
@Component({selector:'app-locations',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,MobileShellComponent],template:`
<wf-customer-shell title="Locations" subtitle="Delivery sites" backRoute="/profile"><main class="screen-body stack"><ion-button class="wf-button" expand="block" routerLink="/location-form"><ion-icon name="add-outline" slot="start"></ion-icon>Add delivery location</ion-button>
<ion-card *ngFor="let location of sites()" class="wf-card"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="business-outline"></ion-icon></div><div class="grow"><div class="row wrap"><strong>{{location.name}}</strong><span *ngIf="location.isDefault" class="pill success">Primary</span></div><p class="caption">{{address(location)}}</p><span class="caption">{{location.contactName || 'No site contact'}}</span></div></div></ion-card-content></ion-card>
<ion-card *ngIf="sites().length===0" class="wf-card"><ion-card-content><p class="caption">No delivery locations yet. Add the first location before placing an order.</p></ion-card-content></ion-card>
</main></wf-customer-shell>`})
export class LocationsPage{private readonly api=inject(CustomerApiService);readonly sites=signal<CustomerSite[]>([]);ionViewWillEnter():void{this.api.getSites().subscribe({next:sites=>this.sites.set(sites)});}address(site:CustomerSite):string{return `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`;}}
