import { Injectable, signal } from '@angular/core';
import { EQUIPMENT, LOCATIONS } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  readonly selectedLocation = signal(LOCATIONS[0]);
  readonly selectedEquipment = signal(EQUIPMENT[0]);
  readonly fuelType = signal('Ultra-Low Sulfur Diesel');
  readonly gallons = signal(500);
  readonly deliveryDate = signal('2026-07-08');
  readonly deliveryWindow = signal('8:00 AM–10:00 AM');
  readonly instructions = signal('Use the east service gate. Call the site manager on arrival.');

  setLocation(id: string) { const found = LOCATIONS.find(x => x.id === id); if (found) this.selectedLocation.set(found); }
  setEquipment(id: string) { const found = EQUIPMENT.find(x => x.id === id); if (found) this.selectedEquipment.set(found); }
}
