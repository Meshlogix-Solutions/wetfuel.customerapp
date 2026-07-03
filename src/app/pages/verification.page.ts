import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonInput, IonItem } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({ selector:'app-verification', standalone:true, imports:[FormsModule, RouterLink, IonButton, IonCard, IonCardContent, IonContent, IonInput, IonItem], template:`
<ion-content [fullscreen]="true"><div class="auth-page"><div class="auth-wrap"><div class="brand-mark"><img src="/wetfuel-logo.webp" alt="WetFuel" class="brand-logo"></div><ion-card class="auth-card"><ion-card-content class="stack"><div><span class="pill info">Secure verification</span><h1>Check your phone</h1><p class="page-lead">Enter the six-digit code sent to ••• ••• 0198.</p></div><ion-item><ion-input label="Verification code" labelPlacement="stacked" inputmode="numeric" maxlength="6" [(ngModel)]="code"></ion-input></ion-item><ion-button class="wf-button" expand="block" routerLink="/home">Verify and continue</ion-button><ion-button fill="clear">Resend code in 00:24</ion-button><a routerLink="/login" class="caption text-center">Back to sign in</a></ion-card-content></ion-card></div></div></ion-content>` })
export class VerificationPage { code='482193'; }
