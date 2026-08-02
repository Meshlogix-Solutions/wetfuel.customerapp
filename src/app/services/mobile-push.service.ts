import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging, Importance } from '@capacitor-firebase/messaging';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CustomerApiService } from './customer-api.service';
import { ToastService } from './toast.service';

const TOKEN_KEY='customer_fcm_token';
@Injectable({providedIn:'root'})
export class MobilePushService {
  private readonly api=inject(CustomerApiService);private readonly router=inject(Router);private readonly toast=inject(ToastService);private initialized=false;
  async initialize():Promise<void>{
    if(this.initialized||!Capacitor.isNativePlatform())return;this.initialized=true;
    await FirebaseMessaging.addListener('tokenReceived',event=>void this.saveToken(event.token));
    await FirebaseMessaging.addListener('notificationReceived',event=>void this.toast.success(event.notification.body??'You have a new delivery update.'));
    await FirebaseMessaging.addListener('notificationActionPerformed',event=>{const data=(event.notification.data??{}) as Record<string,string>;const route=data['route']||(data['jobId']?`/live-tracking/${data['jobId']}`:'/notifications');void this.router.navigateByUrl(route);});
    if(Capacitor.getPlatform()==='android')await FirebaseMessaging.createChannel({id:'deliveries',name:'Delivery updates',description:'Live WetFuel delivery notifications',importance:Importance.High,sound:'default',vibration:true});
    if(localStorage.getItem('customer_access_token'))await this.registerCurrentDevice();
  }
  async registerCurrentDevice():Promise<void>{
    if(!Capacitor.isNativePlatform())return;await this.initialize();const permission=await FirebaseMessaging.requestPermissions();if(permission.receive!=='granted')return;
    const {token}=await FirebaseMessaging.getToken();await this.saveToken(token);
  }
  async unregisterCurrentDevice():Promise<void>{
    if(!Capacitor.isNativePlatform())return;const token=localStorage.getItem(TOKEN_KEY);const platform=Capacitor.getPlatform() as 'android'|'ios';
    if(token){try{await firstValueFrom(this.api.unregisterPushDevice(token,platform));}catch{}}localStorage.removeItem(TOKEN_KEY);try{await FirebaseMessaging.deleteToken();}catch{}
  }
  private async saveToken(token:string):Promise<void>{if(!token||!localStorage.getItem('customer_access_token'))return;const platform=Capacitor.getPlatform() as 'android'|'ios';await firstValueFrom(this.api.registerPushDevice(token,platform));localStorage.setItem(TOKEN_KEY,token);}
}
