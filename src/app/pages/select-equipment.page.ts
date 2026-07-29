import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton,IonCard,IonCardContent,IonIcon,IonSearchbar } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerEquipment } from '../services/customer-api.service';
import { CustomerStateService } from '../services/customer-state.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
@Component({selector:'app-select-equipment',standalone:true,imports:[CommonModule,FormsModule,RouterLink,IonButton,IonCard,IonCardContent,IonIcon,IonSearchbar,MobileShellComponent],template:`<wf-customer-shell title="Select equipment" subtitle="Order fuel" backRoute="/new-order"><main class="screen-body stack"><ion-searchbar placeholder="Search equipment" [ngModel]="search()" (ngModelChange)="search.set($event)"></ion-searchbar><ion-card *ngFor="let item of availableEquipment()" class="wf-card selection-card" [class.selected]="state.selectedEquipment()?.id===item.id" (click)="state.selectEquipment(item)"><ion-card-content><div class="row"><div class="icon-tile"><ion-icon name="cube-outline"></ion-icon></div><div class="grow"><div class="row-between"><strong>{{item.name}}</strong><span class="pill" [class.warning]="(item.estimatedLevelPercent||0)<50" [class.success]="(item.estimatedLevelPercent||0)>=50">{{item.estimatedLevelPercent||0}}%</span></div><p class="caption">{{item.qrCode}} · {{item.siteName}}</p><div class="progress-track orange"><span [style.width.%]="item.estimatedLevelPercent||0"></span></div><p class="caption" style="margin-bottom:0">{{item.fuelType}} · {{item.capacityGallons||0}} gal capacity</p></div><ion-icon *ngIf="state.selectedEquipment()?.id===item.id" name="checkmark-circle-outline" style="font-size:28px;color:var(--wf-primary)"></ion-icon></div></ion-card-content></ion-card><ion-card *ngIf="availableEquipment().length===0" class="wf-card soft-card text-center"><ion-card-content><div class="icon-tile" style="margin:0 auto 10px"><ion-icon name="cube-outline"></ion-icon></div><strong>No active equipment matches</strong><p class="caption">Try a different search term or location.</p></ion-card-content></ion-card><ion-button class="wf-button" expand="block" routerLink="/new-order" [disabled]="!state.selectedEquipment()">Use selected equipment</ion-button></main></wf-customer-shell>`})
export class SelectEquipmentPage{
  private readonly api=inject(CustomerApiService);
  readonly state=inject(CustomerStateService);
  readonly equipment=signal<CustomerEquipment[]>([]);
  readonly search=signal('');
  readonly availableEquipment=computed(()=>{
    const siteId=this.state.selectedLocation()?.id;
    const term=this.search().trim().toLowerCase();
    return this.equipment()
      .filter(x=>x.status==='active'&&(!siteId||x.siteId===siteId))
      .filter(x=>!term||[x.name,x.qrCode,x.siteName,x.fuelType].some(v=>v?.toLowerCase().includes(term)));
  });
  ionViewWillEnter():void{this.api.getEquipment().subscribe({next:rows=>this.equipment.set(rows)});}
}
