import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCheckbox, IonContent, IonInput, IonItem } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { CustomerAuthService } from '../services/customer-auth.service';

@Component({ selector:'app-login', standalone:true, imports:[FormsModule, RouterLink, IonButton, IonCard, IonCardContent, IonCheckbox, IonContent, IonInput, IonItem], template:`
<ion-content [fullscreen]="true"><div class="auth-page"><div class="auth-wrap"><div class="brand-mark"><img src="/wetfuel-logo.webp" alt="WetFuel" class="brand-logo"></div><ion-card class="auth-card"><ion-card-content class="stack"><div><h1>Welcome back</h1><p class="page-lead">Sign in to order fuel, track active deliveries and manage your account.</p></div><ion-item><ion-input label="Email address" labelPlacement="stacked" type="email" [(ngModel)]="email"></ion-input></ion-item><ion-item><ion-input label="Password" labelPlacement="stacked" type="password" [(ngModel)]="password"></ion-input></ion-item><div class="row-between"><ion-checkbox labelPlacement="end">Remember me</ion-checkbox><a routerLink="/verification" class="caption">Forgot password?</a></div><ion-button class="wf-button" expand="block" (click)="login()">Sign in securely</ion-button></ion-card-content></ion-card></div></div></ion-content>` })
export class LoginPage { email=''; password=''; constructor(private readonly auth:CustomerAuthService){} login():void{void this.auth.login();} }
