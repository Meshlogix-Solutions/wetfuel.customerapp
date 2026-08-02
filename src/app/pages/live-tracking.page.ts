import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { CustomerApiService, CustomerJob } from '../services/customer-api.service';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';
import { MapboxTrackingMapComponent } from '../shared/mapbox-tracking-map.component';

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, MobileShellComponent, LoaderComponent, MapboxTrackingMapComponent],
  template: `
    <wf-customer-shell title="Delivery status" [subtitle]="job()?.jobNumber || 'Dispatch'" backRoute="/home" [showNav]="true">
      <main class="screen-body tracking-body">
        @if (job(); as x) {
          <section class="tracking-map" aria-label="Driver position relative to the delivery site">
            @if (hasLiveLocation(x) && x.latitude != null && x.longitude != null) {
              <app-mapbox-tracking-map [driverLatitude]="x.driverLatitude" [driverLongitude]="x.driverLongitude" [siteLatitude]="x.latitude" [siteLongitude]="x.longitude" />
            } @else {
              <div class="tracking-map__roads" aria-hidden="true"></div>
            }
            <div class="live-chip"><span></span>{{ hasLiveLocation(x) ? trackingFreshness(x) : trackingMessage(x) }}</div>
            @if (!hasLiveLocation(x)) {
              <div class="route-arc" aria-hidden="true"></div>
              <div class="route-pin route-pin--start" aria-hidden="true"><span></span></div>
              <div class="route-vehicle" aria-hidden="true"><ion-icon name="truck-outline"></ion-icon></div>
              <div class="route-pin route-pin--destination" aria-hidden="true"><span></span></div>
            }

            <div class="tracking-map__stats">
              <div class="map-stat">
                <span class="map-stat__icon"><ion-icon name="navigate-outline"></ion-icon></span>
                <div><small>Distance to site</small><strong>{{ distanceLabel(x) }}</strong></div>
              </div>
              <div class="map-stat">
                <span class="map-stat__icon"><ion-icon name="time-outline"></ion-icon></span>
                <div><small>Estimated arrival</small><strong>{{ arrivalLabel(x) }}</strong></div>
              </div>
            </div>
          </section>

          <section class="status-hero">
            <div class="status-hero__copy">
              <span class="status-kicker"><span class="status-kicker__dot"></span>{{ x.statusLabel }}</span>
              <h2>{{ x.statusMessage }}</h2>
              <p>Scheduled {{ x.scheduledAt | date:'medium' }}</p>
            </div>
            <div class="driver-identity">
              <div class="driver-avatar"><span>{{ initials(x.driverName) }}</span></div>
              <strong>{{ x.driverName || 'Driver pending' }}</strong>
              <small>{{ x.vehicleUnitNumber || x.vehicleName || 'Vehicle pending' }}</small>
            </div>
          </section>

          <section class="contact-panel">
            <span class="contact-panel__icon"><ion-icon name="call-outline"></ion-icon></span>
            <div class="contact-panel__copy">
              <small>Delivery contact</small>
              <strong>{{ x.siteContactName || 'Site contact' }}</strong>
              <span>{{ x.siteContactPhone || 'Phone number unavailable' }}</span>
            </div>
            @if (x.siteContactPhone) {
              <ion-button class="contact-action" fill="outline" shape="round" [href]="'tel:' + x.siteContactPhone">
                Call contact <ion-icon name="call-outline" slot="end"></ion-icon>
              </ion-button>
            }
          </section>

          <section class="verified-panel">
            <span class="verified-panel__icon"><ion-icon name="shield-checkmark-outline"></ion-icon></span>
            <div>
              <strong>Verified driver updates</strong>
              <p>{{ hasLiveLocation(x) ? 'The position plot and distance refresh every 15 seconds while your driver is en route.' : trackingMessage(x) }}</p>
            </div>
          </section>
        } @else if (error()) {
          <div class="load-error"><span>{{ error() }}</span><button type="button" (click)="load()">Retry</button></div>
        } @else {
          <section><wf-loader mode="section" message="Loading delivery status..." /></section>
        }
      </main>
    </wf-customer-shell>
  `,
  styles: [`
    .tracking-body{display:grid;gap:18px;max-width:760px}
    .tracking-map{position:relative;min-height:360px;overflow:hidden;border:1px solid color-mix(in srgb,var(--wf-border) 75%,var(--wf-primary));border-radius:26px;background:linear-gradient(145deg,color-mix(in srgb,var(--wf-surface) 88%,#071016),color-mix(in srgb,var(--wf-background) 82%,#09141c));box-shadow:0 18px 42px rgba(0,0,0,.16);isolation:isolate}
    .tracking-map::after{content:'';position:absolute;inset:0;z-index:-1;background:radial-gradient(circle at 78% 30%,var(--wf-primary-soft),transparent 28%),linear-gradient(to bottom,transparent 45%,rgba(0,0,0,.18))}
    .tracking-map__roads{position:absolute;inset:-40px;z-index:-2;opacity:.3;background:linear-gradient(38deg,transparent 46%,var(--wf-border) 47%,var(--wf-border) 49%,transparent 50%) 0 0/120px 110px,linear-gradient(-42deg,transparent 46%,var(--wf-border) 47%,var(--wf-border) 49%,transparent 50%) 20px 15px/155px 130px}
    .live-chip{position:absolute;top:20px;left:20px;z-index:4;display:flex;align-items:center;gap:9px;padding:10px 14px;border:1px solid color-mix(in srgb,var(--wf-border) 70%,transparent);border-radius:999px;background:color-mix(in srgb,var(--wf-surface) 82%,transparent);color:var(--wf-text);font-size:13px;font-weight:850;backdrop-filter:blur(12px)}
    .live-chip span{width:9px;height:9px;border-radius:50%;background:var(--wf-primary);box-shadow:0 0 0 5px var(--wf-primary-soft);animation:live-pulse 1.8s ease-out infinite}
    @keyframes live-pulse{50%{box-shadow:0 0 0 9px transparent}}
    .route-arc{position:absolute;left:18%;top:34%;width:61%;height:115px;border:4px dashed var(--wf-accent);border-color:var(--wf-accent) transparent transparent var(--wf-accent);border-radius:75% 0 0 0;transform:rotate(-8deg);filter:drop-shadow(0 2px 5px color-mix(in srgb,var(--wf-accent) 40%,transparent))}
    .route-pin{position:absolute;z-index:2;width:50px;height:50px;border-radius:50% 50% 50% 10px;transform:rotate(-45deg);display:grid;place-items:center;color:#fff;box-shadow:0 12px 28px rgba(0,0,0,.3)}
    .route-pin span{width:17px;height:17px;border:4px solid #fff;border-radius:50%}
    .route-pin--start{left:20%;top:49%;background:var(--wf-accent)}
    .route-pin--destination{right:15%;top:22%;background:var(--wf-primary);box-shadow:0 12px 30px color-mix(in srgb,var(--wf-primary) 48%,transparent)}
    .route-vehicle{position:absolute;z-index:3;left:51%;top:37%;width:48px;height:48px;transform:translate(-50%,-50%);border:5px solid color-mix(in srgb,var(--wf-primary) 22%,var(--wf-surface));border-radius:50%;display:grid;place-items:center;background:var(--wf-surface);color:var(--wf-primary);box-shadow:0 8px 22px rgba(0,0,0,.25)}
    .route-vehicle ion-icon{font-size:22px}
    .tracking-map__stats{position:absolute;z-index:4;left:16px;right:16px;bottom:16px;display:grid;grid-template-columns:1fr 1fr;border:1px solid color-mix(in srgb,var(--wf-border) 70%,transparent);border-radius:20px;background:color-mix(in srgb,var(--wf-surface) 88%,transparent);backdrop-filter:blur(16px);overflow:hidden}
    .map-stat{display:flex;align-items:center;gap:12px;padding:16px}.map-stat+ .map-stat{border-left:1px solid var(--wf-border)}
    .map-stat__icon{width:42px;height:42px;border:1px solid var(--wf-border);border-radius:50%;display:grid;place-items:center;color:var(--wf-primary);flex:0 0 auto}.map-stat__icon ion-icon{font-size:21px}
    .map-stat div{display:grid;gap:2px}.map-stat small{color:var(--wf-muted);font-size:11px}.map-stat strong{color:var(--wf-text);font-size:21px;line-height:1.1}
    .status-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center;padding:22px;border:1px solid var(--wf-primary);border-radius:24px;background:linear-gradient(135deg,var(--wf-surface),color-mix(in srgb,var(--wf-primary-soft) 35%,var(--wf-surface)));box-shadow:0 16px 36px color-mix(in srgb,var(--wf-primary) 10%,transparent)}
    .status-kicker{display:inline-flex;align-items:center;gap:8px;width:max-content;padding:8px 12px;border-radius:999px;background:var(--wf-primary);color:#fff;font-size:12px;font-weight:850}.status-kicker__dot{width:7px;height:7px;border-radius:50%;background:#fff}
    .status-hero h2{margin:14px 0 5px;color:var(--wf-text);font-size:clamp(24px,6vw,34px);letter-spacing:-.045em;line-height:1.05}.status-hero p{margin:0;color:var(--wf-muted);font-size:13px}
    .driver-identity{min-width:112px;display:grid;justify-items:center;gap:5px;text-align:center}.driver-avatar{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:var(--wf-primary-soft);box-shadow:0 0 0 1px var(--wf-primary),0 0 0 8px color-mix(in srgb,var(--wf-primary-soft) 55%,transparent)}.driver-avatar span{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--wf-primary);color:#fff;font-size:20px;font-weight:900}.driver-identity strong{margin-top:6px;color:var(--wf-primary);font-size:13px}.driver-identity small{max-width:130px;color:var(--wf-muted);font-size:11px}
    .contact-panel,.verified-panel{display:flex;align-items:center;gap:16px;padding:20px;border:1px solid var(--wf-border);border-radius:22px;background:var(--wf-surface);color:var(--wf-text)}
    .contact-panel__icon,.verified-panel__icon{width:54px;height:54px;flex:0 0 54px;border:1px solid var(--wf-border);border-radius:50%;display:grid;place-items:center;color:var(--wf-primary);background:var(--wf-primary-soft)}.contact-panel__icon ion-icon,.verified-panel__icon ion-icon{font-size:26px}
    .contact-panel__copy{min-width:0;flex:1;display:grid;gap:2px}.contact-panel__copy small{color:var(--wf-muted);font-size:11px}.contact-panel__copy strong{font-size:18px}.contact-panel__copy span{color:var(--wf-muted);font-size:13px}
    ion-button.contact-action{--border-color:var(--wf-primary);--color:var(--wf-primary);--background:transparent;--border-radius:999px;font-weight:800;text-transform:none}
    .verified-panel{align-items:flex-start}.verified-panel strong{display:block;margin:3px 0 6px;font-size:15px}.verified-panel p{margin:0;color:var(--wf-muted);font-size:13px;line-height:1.55}
    @media(max-width:520px){.tracking-map{min-height:330px}.tracking-map__stats{left:10px;right:10px;bottom:10px}.map-stat{gap:8px;padding:12px}.map-stat__icon{width:36px;height:36px}.map-stat strong{font-size:17px}.status-hero{padding:18px;gap:12px}.driver-avatar{width:66px;height:66px}.driver-avatar span{width:50px;height:50px}.contact-panel{align-items:flex-start;flex-wrap:wrap}.contact-action{width:100%;margin:4px 0 0}.contact-panel__copy{width:calc(100% - 70px)}}
  `],
})
export class LiveTrackingPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CustomerApiService);
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  readonly job = signal<CustomerJob | null>(null);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
    this.pollTimer = setInterval(() => this.load(true), 15_000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  load(silent = false): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    if (!silent) this.error.set('');
    this.api.getJob(id).subscribe({
      next: x => { this.job.set(x); this.error.set(''); },
      error: () => { if (!silent || !this.job()) this.error.set('Delivery status could not be loaded. Check your connection and try again.'); },
    });
  }

  hasLiveLocation(job: CustomerJob): boolean {
    return job.status === 'started' && job.driverLatitude != null && job.driverLongitude != null;
  }

  trackingMessage(job: CustomerJob): string {
    if (job.status === 'started') return 'Waiting for the driver’s first GPS update.';
    if (['arrived', 'equipment_verified', 'fueled', 'proof_submitted', 'completed'].includes(job.status)) return 'The driver has arrived; live location sharing has ended.';
    return 'Live location begins when the driver starts this job.';
  }

  trackingFreshness(job: CustomerJob): string {
    if (!job.locationRecordedAt) return 'Live driver location';
    const seconds = Math.max(0, Math.round((Date.now() - new Date(job.locationRecordedAt).getTime()) / 1000));
    return seconds > 90 ? `Location may be stale · ${Math.round(seconds / 60)} min ago` : `Live · updated ${seconds < 15 ? 'just now' : `${seconds} sec ago`}`;
  }

  driverLeft(job: CustomerJob): number { return this.plot(job).driverX; }
  driverTop(job: CustomerJob): number { return this.plot(job).driverY; }
  siteLeft(job: CustomerJob): number { return this.plot(job).siteX; }
  siteTop(job: CustomerJob): number { return this.plot(job).siteY; }

  private plot(job: CustomerJob): { driverX:number; driverY:number; siteX:number; siteY:number } {
    if (!this.hasLiveLocation(job) || job.latitude == null || job.longitude == null) {
      return { driverX:51, driverY:37, siteX:78, siteY:22 };
    }
    const latSpan = Math.max(Math.abs(job.driverLatitude! - job.latitude), .002);
    const lonSpan = Math.max(Math.abs(job.driverLongitude! - job.longitude), .002);
    const minLat = Math.min(job.driverLatitude!, job.latitude) - latSpan * .2;
    const minLon = Math.min(job.driverLongitude!, job.longitude) - lonSpan * .2;
    const toX = (longitude:number) => 15 + ((longitude - minLon) / (lonSpan * 1.4)) * 70;
    const toY = (latitude:number) => 85 - ((latitude - minLat) / (latSpan * 1.4)) * 70;
    return { driverX:toX(job.driverLongitude!), driverY:toY(job.driverLatitude!), siteX:toX(job.longitude), siteY:toY(job.latitude) };
  }

  initials(name?: string): string {
    return (name || 'DP').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  distanceLabel(job: CustomerJob): string {
    return job.distanceMiles == null ? 'Pending' : job.distanceMiles < 0.1 ? 'On site' : `${job.distanceMiles.toFixed(1)} mi`;
  }

  arrivalLabel(job: CustomerJob): string {
    if (['arrived', 'equipment_verified', 'fueled', 'proof_submitted', 'completed'].includes(job.status)) return 'On site';
    if (job.status === 'cancelled') return 'Cancelled';
    return job.distanceMiles == null ? 'Pending' : `${Math.max(5, Math.round(job.distanceMiles * 2.4))} min`;
  }
}
