import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

export interface ConfirmOptions {title:string;text?:string;confirmText?:string;cancelText?:string;icon?:SweetAlertIcon;danger?:boolean;}

@Injectable({providedIn:'root'})
export class ConfirmService {
  async ask(options:ConfirmOptions):Promise<boolean>{
    const result=await Swal.fire({
      title:options.title,text:options.text,icon:options.icon??(options.danger?'warning':'question'),
      showCancelButton:true,confirmButtonText:options.confirmText??'Confirm',cancelButtonText:options.cancelText??'Cancel',
      reverseButtons:true,focusCancel:options.danger??false,allowOutsideClick:false,heightAuto:false,
    });
    return result.isConfirmed;
  }
  danger(title:string,text:string,confirmText='Confirm'):Promise<boolean>{return this.ask({title,text,confirmText,danger:true});}
}
