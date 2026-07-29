import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonInput, IonItem, IonLabel, IonRange, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { CustomerStateService } from '../services/customer-state.service';
import { ToastService } from '../services/toast.service';
@Component({ selector:'app-order-details', standalone:true, imports:[CommonModule, FormsModule, IonButton, IonCard, IonCardContent, IonInput, IonItem, IonLabel, IonRange, IonSelect, IonSelectOption, MobileShellComponent], template:`
<wf-customer-shell title="Fuel details" subtitle="Step 2 of 4" backRoute="/new-order"><main class="screen-body stack">
<ion-card class="wf-card form-card"><ion-card-content class="stack"><ion-item><ion-select label="Fuel type" labelPlacement="stacked" [(ngModel)]="fuel" [disabled]="!!state.selectedEquipment()" (ionChange)="refreshEstimate()"><ion-select-option value="diesel">Diesel</ion-select-option><ion-select-option value="gasoline_regular">Gasoline (Regular)</ion-select-option><ion-select-option value="gasoline_premium">Gasoline (Premium)</ion-select-option><ion-select-option value="propane">Propane</ion-select-option><ion-select-option value="kerosene">Kerosene</ion-select-option></ion-select></ion-item><ion-item><ion-input label="Requested gallons" labelPlacement="stacked" type="number" min="1" [max]="capacityGallons??undefined" [(ngModel)]="gallons" (ionChange)="refreshEstimate()"></ion-input></ion-item>@if(capacityGallons){<p class="caption" style="margin:0">Equipment capacity: {{capacityGallons|number:'1.0-0'}} gal</p>}<ion-range [min]="rangeMinimum" [max]="rangeMaximum" step="25" snaps="true" pin="true" [(ngModel)]="gallons" (ionChange)="refreshEstimate()"><ion-label slot="start">{{rangeMinimum|number:'1.0-0'}}</ion-label><ion-label slot="end">{{rangeMaximum|number:'1.0-0'}} gal</ion-label></ion-range><ion-item><ion-select label="Fill preference" labelPlacement="stacked" [(ngModel)]="fillPreference" (ionChange)="refreshEstimate()"><ion-select-option value="requested">Deliver requested quantity</ion-select-option><ion-select-option value="fill">Fill equipment safely</ion-select-option></ion-select></ion-item></ion-card-content></ion-card>
<ion-card class="wf-card soft-card"><ion-card-content>@if(state.estimate();as estimate){<div class="detail-row"><span>Estimated fuel subtotal</span><strong>{{estimate.estimatedSubtotal|currency}}</strong></div><div class="detail-row"><span>Estimated taxes & fees</span><strong>{{estimate.estimatedTaxesFees|currency}}</strong></div><div class="detail-row"><span>Estimated total</span><strong>{{estimate.estimatedTotal|currency}}</strong></div>}@else if(state.estimateLoading()){<p class="caption" style="margin:0">Calculating current price and taxes...</p>}@else{<p class="caption" style="margin:0">{{state.estimateError()||'Select valid order details to calculate pricing.'}}</p>}<p class="caption">Final price is based on actual delivered volume and the rate effective at delivery.</p></ion-card-content></ion-card>
<ion-button class="wf-button" expand="block" [disabled]="state.estimateLoading()||!state.estimate()" (click)="continue()">Continue to scheduling</ion-button></main></wf-customer-shell>` })
export class OrderDetailsPage implements OnInit {
  fuel=this.state.selectedEquipment()?.fuel??this.state.fuelType();
  gallons=this.state.gallons();
  fillPreference=this.state.fillPreference();
  readonly capacityGallons=Number(this.state.selectedEquipment()?.capacityGallons)||null;
  readonly rangeMinimum=this.capacityGallons?Math.min(100,this.capacityGallons):100;
  readonly rangeMaximum=this.capacityGallons??1000;
  constructor(readonly state:CustomerStateService,private readonly router:Router,private readonly toast:ToastService){}
  ngOnInit():void{if(this.capacityGallons&&Number(this.gallons)>this.capacityGallons)this.gallons=this.capacityGallons;void this.refreshEstimate(false);}
  save():void{this.state.updateFuelDetails(this.fuel,Number(this.gallons),this.fillPreference);}
  async refreshEstimate(showError=true):Promise<void>{if(!this.normalizeGallons(showError)){this.save();return;}this.save();try{await this.state.refreshEstimate();}catch(error){if(showError)void this.toast.error(this.errorMessage(error));}}
  async continue():Promise<void>{await this.refreshEstimate();if(this.state.estimate())await this.router.navigateByUrl('/schedule-delivery');}
  private normalizeGallons(showError:boolean):boolean{const requested=Number(this.gallons);if(!Number.isFinite(requested)||requested<=0){this.gallons=0;if(showError)void this.toast.error('Requested gallons must be greater than zero.');return false;}if(this.capacityGallons&&requested>this.capacityGallons){this.gallons=this.capacityGallons;if(showError)void this.toast.error(`Requested gallons cannot exceed the equipment capacity of ${this.capacityGallons} gallons.`);}return true;}
  private errorMessage(error:unknown):string{const failure=error as{error?:{message?:string;title?:string};message?:string};return failure.error?.message??failure.error?.title??failure.message??'Pricing estimate is unavailable.';}
}
