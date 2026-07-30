import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton,IonCard,IonCardContent,IonIcon,IonSearchbar } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerEquipment } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';
@Component({selector:'app-equipment',standalone:true,imports:[CommonModule,FormsModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,IonSearchbar,MobileShellComponent,LoaderComponent],template:`
<wf-customer-shell title="Equipment" [subtitle]="allEquipment().length+' registered assets'" [showNav]="true">
@if(loading()&&!hasLoaded()){<section class="screen-body"><wf-loader mode="section" message="Loading equipment..." /></section>}
@else{<main class="screen-body stack">
@if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}
<ion-searchbar placeholder="Search equipment" [ngModel]="search()" (ngModelChange)="search.set($event)"></ion-searchbar><ion-button class="wf-button" expand="block" routerLink="/equipment-form"><ion-icon slot="start" name="add-outline"></ion-icon>Add equipment</ion-button>
<ion-card *ngFor="let item of equipment()" class="wf-card" [routerLink]="['/equipment-detail',item.id]"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="cube-outline"></ion-icon></div><div class="grow"><div class="row-between"><strong>{{item.name}}</strong><span class="pill" [class.warning]="item.status==='needs_service'||(item.estimatedLevelPercent||0)<40" [class.success]="item.isActive&&(item.estimatedLevelPercent||0)>=40">{{item.status==='needs_service'?'Service':(item.estimatedLevelPercent||0)+'%'}}</span></div><p class="caption">{{item.qrCode}} · {{item.siteName}}</p><div class="progress-track orange"><span [style.width.%]="item.estimatedLevelPercent||0"></span></div><p class="caption" style="margin-bottom:0">{{item.fuelType}} · {{item.capacityGallons||0}} gal</p></div><ion-icon name="chevron-forward-outline"></ion-icon></div></ion-card-content></ion-card>
<ion-card *ngIf="equipment().length===0" class="wf-card soft-card text-center"><ion-card-content><div class="icon-tile" style="margin:0 auto 10px"><ion-icon name="cube-outline"></ion-icon></div><strong>{{allEquipment().length===0?'No equipment registered':'No equipment matches your search'}}</strong><p class="caption">{{allEquipment().length===0?'Add an asset before placing an equipment-specific order.':'Try a different search term.'}}</p></ion-card-content></ion-card></main>}
</wf-customer-shell>`})
export class EquipmentPage{
  private readonly api=inject(CustomerApiService);
  readonly allEquipment=signal<CustomerEquipment[]>([]);
  readonly search=signal('');
  readonly loading=signal(true);
  readonly hasLoaded=signal(false);
  readonly error=signal('');
  readonly equipment=computed(()=>{
    const term=this.search().trim().toLowerCase();
    return this.allEquipment().filter(x=>!term||[x.name,x.qrCode,x.siteName,x.fuelType].some(v=>v?.toLowerCase().includes(term)));
  });
  ionViewWillEnter():void{this.load();}
  load():void{
    this.loading.set(true);this.error.set('');
    this.api.getEquipment().subscribe({
      next:rows=>{this.allEquipment.set(rows);this.hasLoaded.set(true);this.loading.set(false);},
      error:()=>{this.error.set('Equipment could not be loaded. Check your connection and try again.');this.loading.set(false);},
    });
  }
}
