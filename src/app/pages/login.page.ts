import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileShellComponent } from '../shared/mobile-shell.component';

@Component({ selector:'app-login', standalone:true, imports:[FormsModule, RouterLink, IonicModule], template:`
<ion-content [fullscreen]="true"><div class="auth-page"><div class="auth-wrap"><div class="brand-mark"><div class="brand-drop"><span>WF</span></div><span>WetFuel Customer</span></div><ion-card class="auth-card"><ion-card-content class="stack"><div><span class="pill success">Customer access</span><h1>Welcome back</h1><p class="page-lead">Sign in to order fuel, track active deliveries and manage your account.</p></div><ion-item><ion-input label="Email address" labelPlacement="stacked" type="email" [(ngModel)]="email"></ion-input></ion-item><ion-item><ion-input label="Password" labelPlacement="stacked" type="password" [(ngModel)]="password"></ion-input></ion-item><div class="row-between"><ion-checkbox labelPlacement="end">Remember me</ion-checkbox><a routerLink="/verification" class="caption">Forgot password?</a></div><ion-button class="wf-button" expand="block" routerLink="/home">Sign in securely</ion-button><ion-button class="wf-button wf-secondary" expand="block" routerLink="/verification">Use a verification code</ion-button><p class="caption text-center">Account: Acme Facilities · WetFuel Dallas North</p></ion-card-content></ion-card></div></div></ion-content>` })
export class LoginPage { email='sarah@acmefacilities.com'; password=''; }
