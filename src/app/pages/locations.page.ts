import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerSite } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';
@Component({selector:'app-locations',standalone:true,imports:[CommonModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,MobileShellComponent,LoaderComponent],template:`
<wf-customer-shell title="Sites" subtitle="Delivery locations" [showNav]="true">
@if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading locations..." /></section>}
@else{<main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
<ion-button class="wf-button" expand="block" routerLink="/location-form"><ion-icon name="add-outline" slot="start"></ion-icon>Add delivery location</ion-button>
<ion-card *ngFor="let location of sites()" class="wf-card"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="business-outline"></ion-icon></div><div class="grow"><div class="row wrap"><strong>{{location.name}}</strong><span *ngIf="location.isDefault" class="pill success">Primary</span></div><p class="caption">{{address(location)}}</p><span class="caption">{{location.contactName || 'No site contact'}}</span></div></div></ion-card-content></ion-card>
<ion-card *ngIf="sites().length===0" class="wf-card soft-card text-center"><ion-card-content><div class="icon-tile" style="margin:0 auto 10px"><ion-icon name="location-outline"></ion-icon></div><strong>No delivery locations yet</strong><p class="caption">Add the first location before placing an order.</p></ion-card-content></ion-card>
</main>}
</wf-customer-shell>`})
export class LocationsPage{
  private readonly api=inject(CustomerApiService);
  readonly sites=signal<CustomerSite[]>([]);
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  ionViewWillEnter():void{this.load();}
  load():void{
    this.loading.set(true);this.error.set('');
    this.api.getSites().subscribe({
      next:sites=>{this.sites.set(sites);this.hasLoaded.set(true);this.loading.set(false);},
      error:()=>{this.error.set('Locations could not be loaded. Check your connection and try again.');this.loading.set(false);},
    });
  }
  address(site:CustomerSite):string{return `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`;}
}
