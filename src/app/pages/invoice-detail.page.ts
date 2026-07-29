import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { MobileShellComponent } from '../shared/mobile-shell.component';
import { LoaderComponent } from '../shared/loader.component';
import { CustomerApiService, CustomerInvoice } from '../services/customer-api.service';
import { ConfirmService } from '../services/confirm.service';
import { ToastService } from '../services/toast.service';

@Component({ selector:'app-invoice-detail', standalone:true, imports:[CommonModule, IonButton, IonCard, IonCardContent, IonIcon, MobileShellComponent, LoaderComponent], template:`
<wf-customer-shell [title]="invoice()?.invoiceNumber||'Invoice'" [subtitle]="statusSubtitle()" backRoute="/invoices" [showNav]="true"><main class="screen-body stack">
@if(invoice();as x){
  <ion-card class="wf-card hero-card"><ion-card-content><span class="pill dark">{{x.status==='paid'?'Paid':(x.status==='payment_pending'?'Payment processing':(x.isOverdue?'Overdue':'Amount due'))}}</span><h2 style="font-size:38px;margin:14px 0 4px">{{x.total|currency}}</h2><p class="caption" style="margin:0">Issued {{x.issueDate|date:'mediumDate'}} · Due {{x.dueDate|date:'mediumDate'}}</p></ion-card-content></ion-card>
  <ion-card class="wf-card"><ion-card-content>@for(li of x.lineItems;track li.id){<div class="detail-row"><span>{{li.jobNumber}} · {{li.fuelType}}</span><strong>{{li.gallons}} gal × {{li.pricePerGallon|currency}}</strong></div>}<div class="divider"></div><div class="detail-row"><span>Fuel subtotal</span><strong>{{x.subtotal|currency}}</strong></div><div class="detail-row"><span>Taxes</span><strong>{{x.taxTotal|currency}}</strong></div><div class="detail-row"><span>Total</span><strong>{{x.total|currency}}</strong></div></ion-card-content></ion-card>
  <ion-card class="wf-card"><ion-card-content><div class="detail-row"><span>Customer</span><strong>{{x.customerName}}</strong></div><div class="detail-row"><span>Status</span><strong>{{x.status==='paid'?('Paid '+(x.paidDate|date:'mediumDate')):(x.status==='payment_pending'?'Confirming with QuickBooks':'Awaiting payment')}}</strong></div></ion-card-content></ion-card>
  @if(x.status==='sent'){<ion-button class="wf-button" expand="block" [disabled]="paying" (click)="pay(x)"><ion-icon name="card-outline" slot="start"></ion-icon>{{paying?'Processing...':'Pay '+(x.total|currency)}}</ion-button>}
  <p class="caption text-center">QuickBooks-backed invoices are marked paid only after QuickBooks confirms the payment.</p>
}@else if(error()){<div class="load-error"><span>{{error()}}</span><button type="button" (click)="load()">Retry</button></div>}@else{<section><wf-loader mode="section" message="Loading invoice..." /></section>}
</main></wf-customer-shell>` })
export class InvoiceDetailPage {
  private readonly route=inject(ActivatedRoute);
  private readonly api=inject(CustomerApiService);
  private readonly confirm=inject(ConfirmService);
  private readonly toast=inject(ToastService);
  readonly invoice=signal<CustomerInvoice|null>(null);
  readonly error=signal('');
  paying=false;
  ngOnInit():void{this.load();}
  load():void{
    const id=this.route.snapshot.paramMap.get('id');if(!id)return;
    this.error.set('');
    this.api.getInvoice(id).subscribe({next:x=>this.invoice.set(x),error:()=>this.error.set('This invoice could not be loaded. Check your connection and try again.')});
  }
  statusSubtitle():string{const x=this.invoice();if(!x)return 'Loading...';return x.status==='paid'?'Paid':(x.status==='payment_pending'?'Payment processing':(x.isOverdue?'Overdue':'Open · Due '+new Date(x.dueDate||'').toLocaleDateString()));}
  async pay(x:CustomerInvoice):Promise<void>{
    if(this.paying)return;
    const ok=await this.confirm.danger(`Pay ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(x.total)}?`,`Confirm invoice ${x.invoiceNumber} has been paid.`,'Confirm payment');
    if(!ok)return;
    this.paying=true;
    this.api.payInvoice(x.id).subscribe({
      next:updated=>{this.invoice.set(updated);this.paying=false;if(updated.status==='payment_pending')void this.toast.success('Payment submitted and awaiting QuickBooks confirmation.');},
      error:error=>{this.paying=false;void this.toast.error(this.errorMessage(error));},
    });
  }
  private errorMessage(error:unknown):string{const failure=error as{error?:{message?:string;title?:string};message?:string};return failure.error?.message??failure.error?.title??failure.message??'This payment could not be recorded. Try again.';}
}
