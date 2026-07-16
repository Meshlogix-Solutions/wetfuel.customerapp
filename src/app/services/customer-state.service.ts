import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EQUIPMENT, LOCATIONS } from '../data/mock-data';
import { AddSiteRequest, CustomerApiService, CustomerProfile, CustomerSite } from './customer-api.service';

const CACHE_KEY='wetfuel_customer_bootstrap';
@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly api=inject(CustomerApiService);
  readonly profile=signal<CustomerProfile|null>(null);
  readonly sites=signal<CustomerSite[]>([]);
  readonly initialized=signal(false);
  readonly selectedLocation=signal(LOCATIONS[0]);
  readonly selectedEquipment=signal(EQUIPMENT[0]);
  readonly fuelType=signal('Ultra-Low Sulfur Diesel');
  readonly gallons=signal(500);
  readonly deliveryDate=signal('2026-07-08');
  readonly deliveryWindow=signal('8:00 AM–10:00 AM');
  readonly instructions=signal('Use the east service gate. Call the site manager on arrival.');

  constructor(){const cached=localStorage.getItem(CACHE_KEY);if(cached){try{this.apply(JSON.parse(cached));}catch{localStorage.removeItem(CACHE_KEY);}}}
  async initialize():Promise<void>{if(!localStorage.getItem('customer_access_token')){this.initialized.set(true);return;}try{await this.refresh();}catch{this.initialized.set(true);}}
  async refresh():Promise<void>{try{const profile=await firstValueFrom(this.api.bootstrap());localStorage.setItem(CACHE_KEY,JSON.stringify(profile));this.apply(profile);}finally{this.initialized.set(true);}}
  async addSite(request:AddSiteRequest):Promise<void>{await firstValueFrom(this.api.addSite(request));await this.refresh();}
  setLocation(id:string):void{const found=this.sites().find(x=>x.id===id);if(found)this.selectedLocation.set({id:found.id,name:found.name,address:this.address(found),primary:found.isDefault});}
  setEquipment(id:string):void{const found=EQUIPMENT.find(x=>x.id===id);if(found)this.selectedEquipment.set(found);}
  address(site:CustomerSite):string{return `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`;}
  private apply(profile:CustomerProfile):void{this.profile.set(profile);this.sites.set(profile.sites);const selected=profile.sites.find(x=>x.isDefault)??profile.sites[0];if(selected)this.selectedLocation.set({id:selected.id,name:selected.name,address:this.address(selected),primary:selected.isDefault});}
}
