import { Injectable } from '@angular/core';
import { User, UserManager } from 'oidc-client-ts';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly manager = new UserManager({
    authority: environment.authority, client_id: environment.clientId,
    redirect_uri: `${window.location.origin}/authenticate`, post_logout_redirect_uri: `${window.location.origin}/login`,
    scope: 'openid profile email offline_access', response_type: 'code', automaticSilentRenew: true,
  });
  constructor() {
    this.manager.events.addUserLoaded(user => this.store(user));
    this.manager.events.addUserUnloaded(() => this.clear());
    this.manager.events.addAccessTokenExpired(() => this.clear());
  }
  async hasValidSession(): Promise<boolean> { const user=await this.manager.getUser(); if(!user||user.expired){this.clear();return false;}this.store(user);return true; }
  login(): Promise<void> { return this.manager.signinRedirect(); }
  async completeLogin(): Promise<User> { const user=await this.manager.signinRedirectCallback();this.store(user);return user; }
  async logout(): Promise<void> { this.clear();await this.manager.signoutRedirect(); }
  private store(user:User):void { localStorage.setItem('customer_access_token',user.access_token); }
  private clear():void { localStorage.removeItem('customer_access_token'); }
}
