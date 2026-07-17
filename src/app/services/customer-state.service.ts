import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EQUIPMENT, LOCATIONS } from '../data/mock-data';
import { AddSiteRequest, CustomerApiService, CustomerEquipment, CustomerOrder, CustomerProfile, CustomerSite, EquipmentInput } from './customer-api.service';

const CACHE_KEY='wetfuel_customer_bootstrap';
@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private readonly api=inject(CustomerApiService);
  readonly profile=signal<CustomerProfile|null>(null);
  readonly sites=signal<CustomerSite[]>([]);
  readonly equipment=signal(EQUIPMENT);
  readonly initialized=signal(false);
  readonly orders=signal<CustomerOrder[]>([]);
  readonly lastOrder=signal<CustomerOrder|null>(null);
  readonly selectedLocation=signal(LOCATIONS[0]);
  readonly selectedEquipment=signal(EQUIPMENT[0]);
  readonly fuelType=signal('Ultra-Low Sulfur Diesel');
  readonly gallons=signal(500);
  readonly deliveryDate=signal(new Date(Date.now()+86400000).toISOString().slice(0,10));
  readonly deliveryWindow=signal('8:00 AM–10:00 AM');
  readonly instructions=signal('Use the east service gate. Call the site manager on arrival.');
  readonly fillPreference=signal('requested');

  constructor(){const cached=localStorage.getItem(CACHE_KEY);if(cached){try{this.apply(JSON.parse(cached));}catch{localStorage.removeItem(CACHE_KEY);}}}
  async initialize():Promise<void>{if(!localStorage.getItem('customer_access_token')){this.initialized.set(true);return;}try{await this.refresh();}catch{this.initialized.set(true);}}
  async refresh():Promise<void>{try{const [profile,equipment,orders]=await Promise.all([firstValueFrom(this.api.bootstrap()),firstValueFrom(this.api.getEquipment()),firstValueFrom(this.api.getOrders())]);localStorage.setItem(CACHE_KEY,JSON.stringify(profile));this.apply(profile);this.applyEquipment(equipment);this.orders.set(orders);}finally{this.initialized.set(true);}}
  async addSite(request:AddSiteRequest):Promise<void>{await firstValueFrom(this.api.addSite(request));await this.refresh();}
  setLocation(id:string):void{const found=this.sites().find(x=>x.id===id);if(found){this.selectedLocation.set({id:found.id,name:found.name,address:this.address(found),primary:found.isDefault});const equipment=this.equipment().find(x=>x.siteId===id&&x.status==='active');if(equipment)this.selectedEquipment.set(equipment);}}
  async addEquipment(request:EquipmentInput):Promise<void>{await firstValueFrom(this.api.createEquipment(request));await this.refresh();}
  async updateEquipment(id:string,request:EquipmentInput&{status:string}):Promise<void>{await firstValueFrom(this.api.updateEquipment(id,request));await this.refresh();}
  setEquipment(id:string):void{const found=this.equipment().find(x=>x.id===id);if(found){this.selectedEquipment.set(found);this.fuelType.set(found.fuel);const site=this.sites().find(x=>x.id===found.siteId);if(site)this.selectedLocation.set({id:site.id,name:site.name,address:this.address(site),primary:site.isDefault});}}
  async submitOrder():Promise<CustomerOrder>{const order=await firstValueFrom(this.api.createOrder({siteId:this.selectedLocation().id,equipmentId:this.selectedEquipment().id,fuelType:this.fuelType(),requestedGallons:this.gallons(),fillPreference:this.fillPreference(),requestedDate:this.deliveryDate(),deliveryWindow:this.deliveryWindow(),instructions:this.instructions()}));this.lastOrder.set(order);this.orders.update(items=>[order,...items.filter(x=>x.id!==order.id)]);return order;}
  async cancelOrder(id:string):Promise<void>{await firstValueFrom(this.api.cancelOrder(id));await this.refresh();}
  address(site:CustomerSite):string{return `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`;}
  private apply(profile:CustomerProfile):void{this.profile.set(profile);this.sites.set(profile.sites);const selected=profile.sites.find(x=>x.isDefault)??profile.sites[0];if(selected)this.selectedLocation.set({id:selected.id,name:selected.name,address:this.address(selected),primary:selected.isDefault});}
  private applyEquipment(items:CustomerEquipment[]):void{const mapped=items.map(x=>({id:x.id,name:x.name,type:x.type,fuel:x.fuelType,capacity:x.capacityGallons??0,current:x.estimatedLevelPercent??0,location:x.siteName,status:x.status,siteId:x.siteId,qrCode:x.qrCode,manufacturer:x.manufacturer,model:x.model,serialNumber:x.serialNumber,accessNotes:x.accessNotes,totalFuelingEvents:x.totalFuelingEvents,totalGallonsDelivered:x.totalGallonsDelivered,lastFueledAt:x.lastFueledAt}));this.equipment.set(mapped);const selected=mapped.find(x=>x.status==='active'&&x.siteId===this.selectedLocation().id)??mapped.find(x=>x.status==='active')??mapped[0];if(selected)this.setEquipment(selected.id);}
}
