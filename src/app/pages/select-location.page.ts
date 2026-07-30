import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon, IonSearchbar } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerSite } from '../services/customer-api.service';
import { CustomerStateService } from '../services/customer-state.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
@Component({selector:'app-select-location',standalone:true,imports:[CommonModule,FormsModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,IonSearchbar,MobileShellComponent],template:`
<wf-customer-shell title="Select location" subtitle="Order fuel" backRoute="/new-order"><main class="screen-body stack"><ion-searchbar placeholder="Search locations" [ngModel]="search()" (ngModelChange)="search.set($event)"></ion-searchbar><ion-card *ngFor="let location of locations()" class="wf-card selection-card" [class.selected]="state.selectedLocation()?.id===location.id" (click)="state.selectLocation(location)"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="business-outline"></ion-icon></div><div class="grow"><div class="row wrap"><strong>{{location.name}}</strong><span *ngIf="location.isDefault" class="pill success">Primary</span></div><p class="caption">{{address(location)}}</p><span class="caption">{{location.contactName || 'No site contact'}}</span></div><ion-icon *ngIf="state.selectedLocation()?.id===location.id" name="checkmark-circle-outline" style="font-size:28px;color:var(--wf-primary)"></ion-icon></div></ion-card-content></ion-card><ion-card *ngIf="locations().length===0" class="wf-card soft-card text-center"><ion-card-content><div class="icon-tile" style="margin:0 auto 10px"><ion-icon name="business-outline"></ion-icon></div><strong>No locations match your search</strong><p class="caption">Try a different search term, or add a new location below.</p></ion-card-content></ion-card><ion-button class="wf-button" expand="block" routerLink="/new-order" [disabled]="!state.selectedLocation()">Use selected location</ion-button><ion-button class="wf-button wf-secondary" expand="block" routerLink="/location-form" [queryParams]="{returnUrl:'/select-location'}"><ion-icon name="add-outline" slot="start"></ion-icon>Add a location</ion-button></main></wf-customer-shell>`})
export class SelectLocationPage{
  private readonly api=inject(CustomerApiService);
  readonly state=inject(CustomerStateService);
  readonly allLocations=signal<CustomerSite[]>([]);
  readonly search=signal('');
  readonly locations=computed(()=>{
    const term=this.search().trim().toLowerCase();
    return this.allLocations().filter(x=>!term||[x.name,x.address,x.city,x.contactName].some(v=>v?.toLowerCase().includes(term)));
  });
  ionViewWillEnter():void{this.api.getSites().subscribe({next:sites=>this.allLocations.set(sites)});}
  address(site:CustomerSite):string{return `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`;}
}
