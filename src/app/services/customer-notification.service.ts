import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, firstValueFrom, forkJoin } from 'rxjs';
import { CustomerApiService } from './customer-api.service';

export interface CustomerNotification {
  id: string;
  kind: 'delivery' | 'equipment';
  title: string;
  detail: string;
  route?: string;
  unread: boolean;
}

const STORAGE_KEY = 'customer_read_notifications';

@Injectable({ providedIn: 'root' })
export class CustomerNotificationService {
  private readonly api = inject(CustomerApiService);
  private readIds = new Set<string>();
  private refreshInFlight: Promise<void> | null = null;
  readonly items = signal<CustomerNotification[]>([]);
  readonly unreadCount = computed(() => this.items().filter(item => item.unread).length);

  constructor(router: Router) {
    this.readIds = new Set(this.restoreReadIds());
    router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => void this.refresh());
    void this.refresh();
    window.setInterval(() => void this.refresh(), 30_000);
  }

  async refresh(): Promise<void> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.load().finally(() => this.refreshInFlight = null);
    return this.refreshInFlight;
  }

  private async load(): Promise<void> {
    try {
      const { jobs, equipment } = await firstValueFrom(forkJoin({
        jobs: this.api.getJobs(),
        equipment: this.api.getEquipment(),
      }));
      const items: CustomerNotification[] = [
        ...jobs.filter(job => !!job.siteTerritoryEnteredAt && ['started', 'arrived', 'equipment_verified'].includes(job.status)).map(job => {
          const id = `job-site-entry:${job.id}:${job.siteTerritoryEnteredAt}`;
          return {
            id,
            kind: 'delivery' as const,
            title: 'Driver is arriving at your site',
            detail: `${job.jobNumber} Â· ${job.siteName}`,
            route: `/live-tracking/${job.id}`,
            unread: !this.readIds.has(id),
          };
        }),
        ...jobs.filter(job => ['started', 'arrived', 'equipment_verified'].includes(job.status)).map(job => {
          const id = `job:${job.id}`;
          return {
            id,
            kind: 'delivery' as const,
            title: 'Driver is on the way',
            detail: `${job.jobNumber} · ${job.siteName}`,
            route: `/live-tracking/${job.id}`,
            unread: !this.readIds.has(id),
          };
        }),
        ...equipment.filter(item => item.status === 'active' && Number(item.estimatedLevelPercent ?? 0) <= 35).map(item => {
          const id = `equipment:${item.id}`;
          return {
            id,
            kind: 'equipment' as const,
            title: 'Equipment may need fuel',
            detail: `${item.name} is estimated at ${item.estimatedLevelPercent ?? 0}% remaining`,
            route: `/equipment-detail/${item.id}`,
            unread: !this.readIds.has(id),
          };
        }),
      ];
      this.items.set(items);
    } catch {
      // Preserve the last known count if a background refresh cannot reach the API.
    }
  }

  markAllRead(): void {
    for (const item of this.items()) this.readIds.add(item.id);
    this.items.update(items => items.map(item => ({ ...item, unread: false })));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.readIds].slice(-500)));
  }

  private restoreReadIds(): string[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  }
}
