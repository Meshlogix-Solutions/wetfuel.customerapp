import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonContent, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ThemeService } from '../services/theme.service';
import { CustomerNotificationService } from '../services/customer-notification.service';

export interface RefreshRequest { complete: () => void; }

@Component({
  selector: 'wf-customer-shell', standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonContent, IonIcon, IonRefresher, IonRefresherContent],
  template: `
    <ion-content [fullscreen]="true">
      <ion-refresher *ngIf="refreshable" slot="fixed" (ionRefresh)="requestPullRefresh($event)">
        <ion-refresher-content pullingText="Pull to refresh" refreshingText="Refreshing..."></ion-refresher-content>
      </ion-refresher>
      <div class="app-frame" [style.--wf-screen-bottom-padding]="bottomPadding">
        <header class="topbar">
          <div class="topbar-left">
            <a *ngIf="backRoute" class="top-icon" [routerLink]="backRoute" aria-label="Back"><ion-icon name="arrow-back-outline"></ion-icon></a>
            <div>
              <div class="eyebrow" *ngIf="subtitle">{{ subtitle }}</div>
              <h1>
                <ng-container *ngIf="accentTitle; else plainTitle">
                  <ng-container *ngIf="titleParts.lead as lead">{{ lead }} </ng-container><span class="title-accent">{{ titleParts.accent }}</span>
                </ng-container>
                <ng-template #plainTitle>{{ title }}</ng-template>
              </h1>
            </div>
          </div>
          <div class="topbar-actions">
            <button *ngIf="refreshable" type="button" class="top-icon refresh-action" [class.refreshing]="refreshing()" [disabled]="refreshing()" (click)="requestHeaderRefresh()" aria-label="Refresh page">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2 5.3"/><path d="M20 4v7h-7"/></svg>
            </button>
            <button
              type="button"
              class="theme-toggle"
              (click)="theme.toggle()"
              [attr.title]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
              [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
              <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
              <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>


            <a class="top-icon" routerLink="/notifications" aria-label="Notifications">
              <ion-icon name="notifications-outline"></ion-icon>
              <span *ngIf="notifications.unreadCount()" class="notification-badge">{{ badgeLabel }}</span>
            </a>
          </div>
        </header>
        <ng-content></ng-content>
        <div class="fixed-footer" *ngIf="fixedFooter" [class.with-nav]="showNav"><ng-content select="[fixedFooterContent]"></ng-content></div>
        <nav class="bottom-nav" *ngIf="showNav">
          <a routerLink="/home" routerLinkActive="active"><ion-icon name="home-outline"></ion-icon><span>Home</span></a>
          <a routerLink="/orders" routerLinkActive="active"><ion-icon name="receipt-outline"></ion-icon><span>Orders</span></a>
          <a routerLink="/locations" routerLinkActive="active"><ion-icon name="business-outline"></ion-icon><span>Sites</span></a>
          <a routerLink="/equipment" routerLinkActive="active"><ion-icon name="cube-outline"></ion-icon><span>Equipment</span></a>
          <a routerLink="/invoices" routerLinkActive="active"><ion-icon name="wallet-outline"></ion-icon><span>Payments</span></a>
          <a routerLink="/profile" routerLinkActive="active"><ion-icon name="settings-outline"></ion-icon><span>Settings</span></a>
        </nav>
      </div>
    </ion-content>
  `,
  styles: [`
    :host{display:contents}
    .app-frame{min-height:100%;background:var(--wf-background)}
    .topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:max(14px,env(safe-area-inset-top)) 16px 12px;background:color-mix(in srgb, var(--wf-surface) 94%, transparent);backdrop-filter:blur(16px);border-bottom:1px solid var(--wf-border)}
    .topbar-left,.topbar-actions{display:flex;align-items:center;gap:10px}.topbar h1{margin:1px 0 0;font-size:22px;letter-spacing:-.035em;color:var(--wf-text);line-height:1.15}.topbar h1 .title-accent{color:var(--wf-primary)}.eyebrow{color:var(--wf-muted);font-size:13px;font-weight:600;text-transform:none;letter-spacing:0}
    .top-icon{position:relative;width:41px;height:41px;border:1px solid var(--wf-border);border-radius:13px;background:var(--wf-surface);display:grid;place-items:center;color:var(--wf-primary);text-decoration:none;flex:0 0 auto}.top-icon ion-icon{font-size:21px}
    .notification-badge{position:absolute;right:-5px;top:-6px;min-width:19px;height:19px;padding:0 5px;display:grid;place-items:center;border-radius:10px;background:var(--wf-danger,#d92d20);color:#fff;border:2px solid var(--wf-surface);font-size:10px;font-weight:900;line-height:1}
    button.top-icon{padding:0;cursor:pointer}.refresh-action svg{width:20px;height:20px}.refresh-action.refreshing svg{animation:refresh-spin .8s linear infinite}@keyframes refresh-spin{to{transform:rotate(360deg)}}
    .theme-toggle{position:relative;width:41px;height:41px;border:1px solid var(--wf-border);border-radius:13px;background:var(--wf-surface);display:grid;place-items:center;color:var(--wf-muted);cursor:pointer;flex:0 0 auto;padding:0}
    .theme-toggle__icon{width:21px;height:21px;transition:transform .2s ease, opacity .2s ease}
    .theme-toggle__icon--moon{position:absolute;opacity:0;transform:rotate(90deg) scale(0)}
    :host-context(html.dark) .theme-toggle__icon--sun{opacity:0;transform:rotate(-90deg) scale(0)}
    :host-context(html.dark) .theme-toggle__icon--moon{opacity:1;transform:rotate(0) scale(1)}
    .fixed-footer{position:fixed;z-index:26;left:50%;transform:translateX(-50%);width:min(calc(100% - 32px),720px);bottom:max(10px,env(safe-area-inset-bottom))}
    .fixed-footer.with-nav{bottom:calc(max(10px,env(safe-area-inset-bottom)) + 96px)}
    .bottom-nav{position:fixed;z-index:25;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 16px),760px);height:72px;border-radius:22px;background:color-mix(in srgb, var(--wf-surface) 96%, transparent);backdrop-filter:blur(18px);box-shadow:0 16px 42px rgba(0,0,0,.18);border:1px solid var(--wf-border);display:grid;grid-template-columns:repeat(6,1fr);padding:6px 2px}
    .bottom-nav a{color:var(--wf-muted);text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:100%;box-sizing:border-box;border-radius:15px;font-size:9.5px;font-weight:800;line-height:1;padding:0 2px;text-align:center}
    .bottom-nav a span{line-height:1;white-space:nowrap}
    .bottom-nav ion-icon{width:20px;height:20px;font-size:20px;flex:0 0 auto;display:block}
    .bottom-nav a.active{color:var(--wf-primary);background:var(--wf-primary-soft)}
    @media(max-width:430px){.refresh-action{display:none}}
    @media(max-width:380px){.bottom-nav a span{display:none}.bottom-nav ion-icon{width:22px;height:22px;font-size:22px}}
  `]
})
export class MobileShellComponent {
  @Input({required:true}) title='';
  @Input() subtitle='';
  @Input() backRoute='';
  @Input() showNav=false;
  @Input() fixedFooter=false;


  @Input() refreshable=false;
  @Input() accentTitle=false;
  get titleParts():{lead:string;accent:string}{
    const parts=this.title.trim().split(/\s+/).filter(Boolean);
    if(parts.length<=1)return {lead:'',accent:this.title||'Your account'};
    return {lead:parts.slice(0,-1).join(' '),accent:parts[parts.length-1]};
  }
  get bottomPadding():string{
    if(this.showNav)return this.fixedFooter?'196px':'110px';
    return this.fixedFooter?'100px':'28px';
  }
  @Output() readonly refreshRequested=new EventEmitter<RefreshRequest>();
  readonly refreshing=signal(false);
  readonly theme = inject(ThemeService);
  readonly notifications = inject(CustomerNotificationService);
  get badgeLabel(): string { return this.notifications.unreadCount() > 99 ? '99+' : String(this.notifications.unreadCount()); }
  requestHeaderRefresh():void{if(this.refreshing())return;this.refreshing.set(true);this.refreshRequested.emit({complete:()=>this.refreshing.set(false)});}
  requestPullRefresh(event:CustomEvent):void{if(this.refreshing()){void (event.target as HTMLIonRefresherElement).complete();return;}this.refreshing.set(true);this.refreshRequested.emit({complete:()=>{this.refreshing.set(false);void (event.target as HTMLIonRefresherElement).complete();}});}
}
