import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, homeOutline, notificationsOutline, personOutline, receiptOutline, cubeOutline, locationOutline, chevronForwardOutline, calendarOutline, timeOutline, carOutline, callOutline, addOutline, cardOutline, documentTextOutline, cameraOutline, qrCodeOutline, businessOutline, settingsOutline, logOutOutline, checkmarkCircleOutline, warningOutline, navigateOutline, downloadOutline, mailOutline, informationCircleOutline, searchOutline, filterOutline, pencilOutline, trashOutline, shieldCheckmarkOutline } from 'ionicons/icons';
@Component({ selector:'app-root', standalone:true, imports:[IonApp,IonRouterOutlet], template:'<ion-app><ion-router-outlet></ion-router-outlet></ion-app>' })
export class AppComponent {
  private readonly router=inject(Router);
  constructor(){
    if(Capacitor.isNativePlatform()){
      App.addListener('backButton',()=>{
        const path=this.router.url.split('?')[0];
        if(['/home','/login','/splash'].includes(path)){
          void App.exitApp();
        }else if(window.history.length>1){
          window.history.back();
        }else{
          void this.router.navigateByUrl('/home');
        }
      });
    }
    addIcons({
  'arrow-back-outline':arrowBackOutline,'home-outline':homeOutline,'notifications-outline':notificationsOutline,'person-outline':personOutline,'receipt-outline':receiptOutline,'cube-outline':cubeOutline,'location-outline':locationOutline,'chevron-forward-outline':chevronForwardOutline,'calendar-outline':calendarOutline,'time-outline':timeOutline,'truck-outline':carOutline,'call-outline':callOutline,'add-outline':addOutline,'card-outline':cardOutline,'document-text-outline':documentTextOutline,'camera-outline':cameraOutline,'qr-code-outline':qrCodeOutline,'business-outline':businessOutline,'settings-outline':settingsOutline,'log-out-outline':logOutOutline,'checkmark-circle-outline':checkmarkCircleOutline,'warning-outline':warningOutline,'navigate-outline':navigateOutline,'download-outline':downloadOutline,'mail-outline':mailOutline,'information-circle-outline':informationCircleOutline,'search-outline':searchOutline,'filter-outline':filterOutline,'pencil-outline':pencilOutline,'trash-outline':trashOutline,'shield-checkmark-outline':shieldCheckmarkOutline
});
  }
}
