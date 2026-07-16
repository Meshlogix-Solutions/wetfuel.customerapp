import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CustomerAuthService } from '../services/customer-auth.service';
import { CustomerStateService } from '../services/customer-state.service';
@Component({selector:'app-authenticate',standalone:true,imports:[IonContent],template:'<ion-content><div class="auth-page"><p>Signing you in...</p></div></ion-content>'})
export class AuthenticatePage {
  private readonly auth=inject(CustomerAuthService);private readonly state=inject(CustomerStateService);private readonly router=inject(Router);
  async ngOnInit():Promise<void>{try{await this.auth.completeLogin();await this.state.refresh();await this.router.navigateByUrl('/home');}catch{await this.router.navigateByUrl('/login');}}
}
