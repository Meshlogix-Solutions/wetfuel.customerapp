import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonInput, IonItem } from '@ionic/angular/standalone';
import { CustomerAuthService } from '../services/customer-auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IonButton, IonCard, IonCardContent, IonContent, IonInput, IonItem],
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
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  email = '';
  password = '';
  loading = false;

  async login(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      void this.toast.error('Enter your email address and password.');
      return;
    }
    this.loading = true;
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl('/home');
    } catch (err: unknown) {
      const failure = err as { status?: number; error?: { message?: string }; message?: string };
      const message = failure.status === 0
        ? 'The WetFuel service could not be reached. Check your internet connection and try again.'
        : failure.status === 401
          ? 'Invalid email or password.'
          : failure.error?.message ?? failure.message ?? 'Sign in could not be completed.';
      void this.toast.error(message);
    } finally {
      this.loading = false;
    }
  }
}
