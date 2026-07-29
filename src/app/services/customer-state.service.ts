import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CreateCustomerOrderRequest,
  CustomerApiService,
  CustomerEquipment,
  CustomerOrderEstimate,
  CustomerOrder,
  CustomerSite,
} from './customer-api.service';

export interface OrderLocation {
  id: string;
  name: string;
  address: string;
}

export interface OrderEquipment {
  id: string;
  siteId: string;
  name: string;
  fuel: string;
  current: number;
  capacityGallons?: number;
}

interface CustomerOrderDraft {
  selectedLocation: OrderLocation | null;
  selectedEquipment: OrderEquipment | null;
  fuelType: string;
  gallons: number;
  deliveryDate: string;
  deliveryWindow: string;
  instructions: string;
  fillPreference: string;
}

const DRAFT_KEY_PREFIX = 'wetfuel_customer_order_draft';
const DEFAULT_DRAFT: CustomerOrderDraft = {
  selectedLocation: null,
  selectedEquipment: null,
  fuelType: 'diesel',
  gallons: 500,
  deliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  deliveryWindow: '8:00 AM–10:00 AM',
  instructions: '',
  fillPreference: 'requested',
};

// Like DriverStateService, this service holds only state that genuinely spans screens.
// Customer profile, equipment, orders, and jobs belong to their pages and are fetched there.
@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly api = inject(CustomerApiService);
  private readonly initial = this.restoreDraft();
  private estimateRequestId = 0;

  readonly selectedLocation = signal<OrderLocation | null>(this.initial.selectedLocation);
  readonly selectedEquipment = signal<OrderEquipment | null>(this.initial.selectedEquipment);
  readonly fuelType = signal(this.initial.fuelType);
  readonly gallons = signal(this.initial.gallons);
  readonly deliveryDate = signal(this.initial.deliveryDate);
  readonly deliveryWindow = signal(this.initial.deliveryWindow);
  readonly instructions = signal(this.initial.instructions);
  readonly fillPreference = signal(this.initial.fillPreference);
  readonly estimate = signal<CustomerOrderEstimate | null>(null);
  readonly estimateLoading = signal(false);
  readonly estimateError = signal('');

  selectLocation(site: CustomerSite): void {
    this.invalidateEstimate();
    this.selectedLocation.set({ id: site.id, name: site.name, address: this.address(site) });
    if (this.selectedEquipment()?.siteId !== site.id) this.selectedEquipment.set(null);
    this.persistDraft();
  }

  selectEquipment(equipment: CustomerEquipment): void {
    this.invalidateEstimate();
    this.selectedEquipment.set({
      id: equipment.id,
      siteId: equipment.siteId,
      name: equipment.name,
      fuel: equipment.fuelType,
      current: equipment.estimatedLevelPercent ?? 0,
      capacityGallons: equipment.capacityGallons,
    });
    this.selectedLocation.set({
      id: equipment.siteId,
      name: equipment.siteName,
      address: equipment.siteAddress,
    });
    this.fuelType.set(equipment.fuelType);
    this.persistDraft();
  }

  updateFuelDetails(fuelType: string, gallons: number, fillPreference: string): void {
    this.invalidateEstimate();
    this.fuelType.set(fuelType);
    this.gallons.set(gallons);
    this.fillPreference.set(fillPreference);
    this.persistDraft();
  }

  updateSchedule(deliveryDate: string, deliveryWindow: string, instructions: string): void {
    this.deliveryDate.set(deliveryDate);
    this.deliveryWindow.set(deliveryWindow);
    this.instructions.set(instructions);
    this.persistDraft();
  }

  canAccessOrderStep(step: 'details' | 'schedule' | 'review'): boolean {
    if (!this.selectedLocation() || !this.selectedEquipment()) return false;
    if (step === 'details') return true;
    if (!this.fuelType() || this.gallons() <= 0) return false;
    if (step === 'schedule') return true;
    return Boolean(this.deliveryDate() && this.deliveryWindow());
  }

  async refreshEstimate(): Promise<CustomerOrderEstimate | null> {
    const location = this.selectedLocation();
    const equipment = this.selectedEquipment();
    const requestId = ++this.estimateRequestId;
    if (!location || !equipment || !this.fuelType() || this.gallons() <= 0) {
      this.estimate.set(null);
      this.estimateError.set('');
      this.estimateLoading.set(false);
      return null;
    }
    this.estimateLoading.set(true);
    this.estimateError.set('');
    try {
      const estimate = await firstValueFrom(this.api.estimateOrder({
        siteId: location.id,
        equipmentId: equipment.id,
        fuelType: this.fuelType(),
        requestedGallons: this.gallons(),
        fillPreference: this.fillPreference(),
      }));
      if (requestId === this.estimateRequestId) this.estimate.set(estimate);
      return estimate;
    } catch (error) {
      if (requestId !== this.estimateRequestId) return null;
      const failure = error as { error?: { message?: string; title?: string }; message?: string };
      this.estimate.set(null);
      this.estimateError.set(failure.error?.message ?? failure.error?.title ?? failure.message ?? 'Pricing estimate is unavailable.');
      throw error;
    } finally {
      if (requestId === this.estimateRequestId) this.estimateLoading.set(false);
    }
  }

  async submitOrder(): Promise<CustomerOrder> {
    const location = this.selectedLocation();
    const equipment = this.selectedEquipment();
    if (!location || !equipment) throw new Error('Select a location and equipment first.');
    const request: CreateCustomerOrderRequest = {
      siteId: location.id,
      equipmentId: equipment.id,
      fuelType: this.fuelType(),
      requestedGallons: this.gallons(),
      fillPreference: this.fillPreference(),
      requestedDate: this.deliveryDate(),
      deliveryWindow: this.deliveryWindow(),
      instructions: this.instructions() || undefined,
    };
    const order = await firstValueFrom(this.api.createOrder(request));
    this.clearOrderDraft();
    return order;
  }

  clearOrderDraft(): void {
    localStorage.removeItem(this.draftKey());
    this.selectedLocation.set(null);
    this.selectedEquipment.set(null);
    this.fuelType.set(DEFAULT_DRAFT.fuelType);
    this.gallons.set(DEFAULT_DRAFT.gallons);
    this.deliveryDate.set(DEFAULT_DRAFT.deliveryDate);
    this.deliveryWindow.set(DEFAULT_DRAFT.deliveryWindow);
    this.instructions.set(DEFAULT_DRAFT.instructions);
    this.fillPreference.set(DEFAULT_DRAFT.fillPreference);
    this.invalidateEstimate();
  }

  address(site: CustomerSite): string {
    return `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`;
  }

  reconcileDraft(sites: CustomerSite[], equipment: CustomerEquipment[]): void {
    const location = sites.find(site => site.id === this.selectedLocation()?.id);
    const item = equipment.find(candidate => candidate.id === this.selectedEquipment()?.id
      && candidate.status === 'active' && candidate.siteId === location?.id);
    if (!location || !item) {
      this.clearOrderDraft();
      return;
    }
    this.selectLocation(location);
    this.selectEquipment(item);
  }

  private invalidateEstimate(): void {
    this.estimateRequestId++;
    this.estimate.set(null);
    this.estimateLoading.set(false);
    this.estimateError.set('');
  }

  private persistDraft(): void {
    localStorage.setItem(this.draftKey(), JSON.stringify({
      selectedLocation: this.selectedLocation(),
      selectedEquipment: this.selectedEquipment(),
      fuelType: this.fuelType(),
      gallons: this.gallons(),
      deliveryDate: this.deliveryDate(),
      deliveryWindow: this.deliveryWindow(),
      instructions: this.instructions(),
      fillPreference: this.fillPreference(),
    } satisfies CustomerOrderDraft));
  }

  private restoreDraft(): CustomerOrderDraft {
    const raw = localStorage.getItem(this.draftKey());
    if (!raw) return DEFAULT_DRAFT;
    try {
      const draft = { ...DEFAULT_DRAFT, ...JSON.parse(raw) } as CustomerOrderDraft;
      const legacyFuelTypes: Record<string, string> = {
        'Ultra-Low Sulfur Diesel': 'diesel',
        'Off-road Diesel': 'diesel',
        'Regular Unleaded': 'gasoline_regular',
      };
      draft.fuelType = legacyFuelTypes[draft.fuelType] ?? draft.fuelType;
      return draft;
    } catch {
      localStorage.removeItem(this.draftKey());
      return DEFAULT_DRAFT;
    }
  }

  private draftKey(): string {
    return `${DRAFT_KEY_PREFIX}:${localStorage.getItem('customer_user_id') ?? 'anonymous'}`;
  }
}
