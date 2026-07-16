import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonInput, IonItem, IonToggle } from '@ionic/angular/standalone';
import { CustomerStateService } from '../services/customer-state.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
@Component({selector:'app-location-form',standalone:true,imports:[FormsModule,IonButton,IonCard,IonCardContent,IonInput,IonItem,IonToggle,MobileShellComponent],template:`
<wf-customer-shell title="Add location" subtitle="Delivery site" backRoute="/locations"><main class="screen-body stack"><ion-card class="wf-card form-card"><ion-card-content class="stack">
<ion-item><ion-input label="Location name" labelPlacement="stacked" [(ngModel)]="form.name" placeholder="e.g. South Distribution Center"></ion-input></ion-item>
<ion-item><ion-input label="Street address" labelPlacement="stacked" [(ngModel)]="form.address"></ion-input></ion-item>
<div class="grid-2"><ion-item><ion-input label="City" labelPlacement="stacked" [(ngModel)]="form.city"></ion-input></ion-item><ion-item><ion-input label="State" maxlength="2" labelPlacement="stacked" [(ngModel)]="form.state"></ion-input></ion-item></div>
<ion-item><ion-input label="ZIP code" labelPlacement="stacked" [(ngModel)]="form.zipCode"></ion-input></ion-item><ion-item><ion-input label="On-site contact" labelPlacement="stacked" [(ngModel)]="form.contactName"></ion-input></ion-item><ion-item><ion-input label="Contact phone" labelPlacement="stacked" type="tel" [(ngModel)]="form.contactPhone"></ion-input></ion-item><ion-toggle [(ngModel)]="form.isDefault">Make this my primary location</ion-toggle>
</ion-card-content></ion-card>@if(error){<p style="color:var(--ion-color-danger)">{{error}}</p>}<ion-button class="wf-button" expand="block" [disabled]="saving" (click)="save()">{{saving?'Saving...':'Save location'}}</ion-button></main></wf-customer-shell>`})
export class LocationFormPage{
  private readonly state=inject(CustomerStateService);private readonly router=inject(Router);saving=false;error='';
  form={name:'',address:'',city:'',state:'',zipCode:'',contactName:'',contactPhone:'',isDefault:false};
  async save():Promise<void>{if(!this.form.name.trim()||!this.form.address.trim()||!this.form.city.trim()||this.form.state.trim().length!==2||!this.form.zipCode.trim()){this.error='Complete the required address fields.';return;}this.saving=true;this.error='';try{await this.state.addSite({...this.form,contactName:this.form.contactName||undefined,contactPhone:this.form.contactPhone||undefined});await this.router.navigateByUrl('/locations');}catch{this.error='The location could not be saved.';}finally{this.saving=false;}}
}
