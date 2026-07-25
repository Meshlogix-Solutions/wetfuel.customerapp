import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCheckbox, IonContent, IonInput, IonItem } from '@ionic/angular/standalone';
import { CustomerAuthService } from '../services/customer-auth.service';
import { CustomerStateService } from '../services/customer-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonCard, IonCardContent, IonCheckbox, IonContent, IonInput, IonItem],
  template: `
<ion-content [fullscreen]="true">
  <div class="auth-page">
    <div class="auth-wrap">
      <div class="brand-mark"><img src="/wetfuel-logo.webp" alt="WetFuel" class="brand-logo"></div>
      <ion-card class="auth-card">
        <ion-card-content class="stack">
          <div>
            <h1>Welcome back</h1>
            <p class="page-lead">Sign in to order fuel, track active deliveries and manage your account.</p>
          </div>
          <ion-item><ion-input label="Email address" labelPlacement="stacked" type="email" [(ngModel)]="email"></ion-input></ion-item>
          <ion-item><ion-input label="Password" labelPlacement="stacked" type="password" [(ngModel)]="password"></ion-input></ion-item>
          <div class="row-between"><ion-checkbox labelPlacement="end">Remember me</ion-checkbox><a routerLink="/verification" class="caption">Forgot password?</a></div>
          @if (error) { <p style="color:var(--ion-color-danger)">{{ error }}</p> }
          <ion-button class="wf-button" expand="block" [disabled]="loading" (click)="login()">{{ loading ? 'Signing in...' : 'Sign in securely' }}</ion-button>
        </ion-card-content>
      </ion-card>
    </div>
  </div>
</ion-content>
  `,
})
export class LoginPage {
  private readonly auth = inject(CustomerAuthService);
  private readonly state = inject(CustomerStateService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  async login(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.login(this.email, this.password);
      await this.state.refresh();
      await this.router.navigateByUrl('/home');
    } catch (err: unknown) {
      const failure = err as { error?: { message?: string }; message?: string };
      this.error = failure.error?.message ?? failure.message ?? 'Invalid email or password.';
    } finally {
      this.loading = false;
    }
  }
}
