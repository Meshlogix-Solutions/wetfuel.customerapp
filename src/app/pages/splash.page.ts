import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({ selector:'app-splash', standalone:true, imports:[RouterLink, IonicModule], template:`
<ion-content [fullscreen]="true"><div class="splash-page"><div><div class="splash-logo"><span>WF</span></div><h1>WetFuel</h1><h2 style="margin:8px 0 0;font-weight:600">Fuel delivered with confidence.</h2><p>Order fuel, track your driver, manage equipment and review every delivery from one mobile app.</p><ion-button class="wf-button" color="tertiary" expand="block" routerLink="/login">Get started</ion-button></div></div></ion-content>` })
export class SplashPage {  }
