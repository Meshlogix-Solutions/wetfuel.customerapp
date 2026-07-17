import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserManager } from 'oidc-client-ts';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly manager = new UserManager({
    authority: environment.authority, client_id: environment.clientId,
    redirect_uri: `${window.location.origin}/authenticate`, post_logout_redirect_uri: `${window.location.origin}/login`,
    scope: 'openid profile email offline_access', response_type: 'code', automaticSilentRenew: true,
  });
  constructor(private readonly router: Router) {
    this.manager.events.addUserLoaded(user => this.store(user));
    this.manager.events.addUserUnloaded(() => this.clear());
    this.manager.events.addAccessTokenExpired(() => this.expireSession());
  }
  async hasValidSession(): Promise<boolean> { const user=await this.manager.getUser(); if(!user||user.expired){this.clear();return false;}this.store(user);return true; }
  login(): Promise<void> { return this.manager.signinRedirect(); }
  async completeLogin(): Promise<User> { const user=await this.manager.signinRedirectCallback();this.store(user);return user; }
  async logout(): Promise<void> { this.clear();await this.manager.signoutRedirect(); }
  expireSession():void {
    this.clear();
    void this.manager.removeUser();
    if(!['/login','/authenticate'].includes(this.router.url.split('?')[0]))
      void this.router.navigateByUrl('/login',{replaceUrl:true});
  }
  private store(user:User):void { localStorage.setItem('customer_access_token',user.access_token); }
  private clear():void { localStorage.removeItem('customer_access_token'); }
}
