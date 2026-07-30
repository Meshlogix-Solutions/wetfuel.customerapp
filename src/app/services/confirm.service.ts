import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

export interface ConfirmOptions {title:string;text?:string;confirmText?:string;cancelText?:string;icon?:SweetAlertIcon;danger?:boolean;}

@Injectable({providedIn:'root'})
export class ConfirmService {
  async ask(options:ConfirmOptions):Promise<boolean>{
    const result=await Swal.fire({
      title:options.title,text:options.text,icon:options.icon??(options.danger?'warning':'question'),
      showCancelButton:true,confirmButtonText:options.confirmText??'Confirm',cancelButtonText:options.cancelText??'Cancel',
      buttonsStyling:false,reverseButtons:true,focusCancel:options.danger??false,allowOutsideClick:false,heightAuto:false,
      background:'var(--wf-surface)',color:'var(--wf-text)',
      customClass:{
        popup:'wf-swal-popup',title:'wf-swal-title',htmlContainer:'wf-swal-text',actions:'wf-swal-actions',
        confirmButton:options.danger?'wf-swal-btn wf-swal-btn--danger':'wf-swal-btn wf-swal-btn--primary',
        cancelButton:'wf-swal-btn wf-swal-btn--cancel',
      },
    });
    return result.isConfirmed;
  }
  danger(title:string,text:string,confirmText='Confirm'):Promise<boolean>{return this.ask({title,text,confirmText,danger:true});}
}
