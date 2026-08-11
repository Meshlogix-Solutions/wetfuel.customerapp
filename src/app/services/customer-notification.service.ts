import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { CustomerApiService } from './customer-api.service';

export interface CustomerNotification {
  id: string;
  kind: 'delivery' | 'equipment';
  title: string;
  detail: string;
  route?: string;
  unread: boolean;
}

@Injectable({ providedIn: 'root' })
export class CustomerNotificationService {
  private readonly api = inject(CustomerApiService);
  private refreshInFlight: Promise<void> | null = null;
  readonly items = signal<CustomerNotification[]>([]);
  readonly unreadCount = computed(() => this.items().filter(item => item.unread).length);

  constructor(router: Router) {
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
      const notifications = await firstValueFrom(this.api.getNotifications());
      this.items.set(notifications.map(notification => ({
        id: notification.id,
        kind: notification.category === 'delivery' ? 'delivery' : 'equipment',
        title: notification.title,
        detail: notification.message,
        route: notification.link,
        unread: !notification.isRead,
      })));
    } catch {
      // Preserve the last known count if a background refresh cannot reach the API.
    }
  }

  markAllRead(): void {
    this.items.update(items => items.map(item => ({ ...item, unread: false })));
    this.api.markAllNotificationsRead().subscribe({
      error: () => void this.refresh(),
    });
  }
}
