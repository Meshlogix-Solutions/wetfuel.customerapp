import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

/**
 * Shared error/validation toast used in place of inline "{{ error }}" paragraphs scattered
 * across pages - those rely on each page's own layout to stay visible. A toast is a single
 * overlay mounted at the app root, so it renders reliably regardless of which page triggered it.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastController = inject(ToastController);

  async error(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color: 'danger',
      position: 'bottom',
      icon: 'warning-outline',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await toast.present();
  }

  async success(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle-outline',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await toast.present();
  }
}
