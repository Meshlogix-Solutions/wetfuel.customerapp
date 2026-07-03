import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'wf-customer-shell', standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonicModule],
  template: `
    <ion-content [fullscreen]="true">
      <div class="app-frame">
        <header class="topbar">
          <div class="topbar-left">
            <a *ngIf="backRoute" class="top-icon" [routerLink]="backRoute" aria-label="Back"><ion-icon name="arrow-back-outline"></ion-icon></a>
            <div><div class="eyebrow" *ngIf="subtitle">{{ subtitle }}</div><h1>{{ title }}</h1></div>
          </div>
          <div class="topbar-actions">
            <a *ngIf="showSupport" class="top-icon" routerLink="/support" aria-label="Support"><ion-icon name="help-circle-outline"></ion-icon></a>
            <a class="top-icon" routerLink="/notifications" aria-label="Notifications"><ion-icon name="notifications-outline"></ion-icon><span class="notification-dot"></span></a>
          </div>
        </header>
        <ng-content></ng-content>
        <nav class="bottom-nav" *ngIf="showNav">
          <a routerLink="/home" routerLinkActive="active"><ion-icon name="home-outline"></ion-icon><span>Home</span></a>
          <a routerLink="/orders" routerLinkActive="active"><ion-icon name="receipt-outline"></ion-icon><span>Orders</span></a>
          <a routerLink="/equipment" routerLinkActive="active"><ion-icon name="cube-outline"></ion-icon><span>Equipment</span></a>
          <a routerLink="/profile" routerLinkActive="active"><ion-icon name="person-outline"></ion-icon><span>Account</span></a>
        </nav>
      </div>
    </ion-content>
  `,
  styles: [`
    :host{display:contents}
    .app-frame{min-height:100%;background:var(--wf-background)}
    .topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:max(14px,env(safe-area-inset-top)) 16px 12px;background:rgba(245,248,249,.94);backdrop-filter:blur(16px);border-bottom:1px solid rgba(219,229,233,.78)}
    .topbar-left,.topbar-actions{display:flex;align-items:center;gap:10px}.topbar h1{margin:1px 0 0;font-size:22px;letter-spacing:-.035em}.eyebrow{color:var(--wf-muted);font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.08em}
    .top-icon{position:relative;width:41px;height:41px;border:1px solid var(--wf-border);border-radius:13px;background:white;display:grid;place-items:center;color:var(--wf-primary);text-decoration:none;flex:0 0 auto}.top-icon ion-icon{font-size:21px}.notification-dot{position:absolute;right:7px;top:7px;width:8px;height:8px;background:var(--wf-accent);border:2px solid white;border-radius:50%}
    .bottom-nav{position:fixed;z-index:25;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 24px),680px);height:72px;border-radius:22px;background:rgba(255,255,255,.97);backdrop-filter:blur(18px);box-shadow:0 16px 42px rgba(13,47,63,.18);border:1px solid rgba(219,229,233,.9);display:grid;grid-template-columns:repeat(4,1fr);padding:7px}
    .bottom-nav a{color:#7b8d95;text-decoration:none;display:grid;place-items:center;align-content:center;gap:4px;border-radius:15px;font-size:11px;font-weight:800}.bottom-nav ion-icon{font-size:21px}.bottom-nav a.active{color:var(--wf-primary);background:var(--wf-primary-soft)}
  `]
})
export class MobileShellComponent { @Input({required:true}) title=''; @Input() subtitle=''; @Input() backRoute=''; @Input() showNav=false; @Input() showSupport=true; }
