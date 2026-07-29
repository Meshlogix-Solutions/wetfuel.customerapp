import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
interface ApiResponse<T>{data:T;message:string;statusCode:number;}
export interface CustomerSite { id:string;customerId:string;name:string;address:string;city:string;state:string;zipCode:string;latitude?:number;longitude?:number;contactName?:string;contactPhone?:string;equipmentCount:number;isDefault:boolean; }
export interface CustomerProfile { id:string;companyName:string;contactName:string;contactFirstName:string;contactLastName:string;contactEmail:string;contactPhone?:string;billingTerm:string;status:string;totalDeliveries:number;totalGallonsDelivered:number;outstandingBalance:number; }
export interface AddSiteRequest { name:string;address:string;city:string;state:string;zipCode:string;latitude?:number;longitude?:number;contactName?:string;contactPhone?:string;isDefault:boolean; }
export interface CustomerEquipment {id:string;customerId:string;customerName:string;siteId:string;siteName:string;siteAddress:string;name:string;type:string;manufacturer?:string;model?:string;serialNumber?:string;capacityGallons?:number;fuelType:string;qrCode:string;status:string;estimatedLevelPercent?:number;latitude?:number;longitude?:number;photoUrl?:string;accessNotes?:string;installDate?:string;totalFuelingEvents:number;totalGallonsDelivered:number;lastFueledAt?:string;recentFuelings:Array<{id:string;jobId:string;jobNumber:string;deliveredGallons:number;completedAt:string}>;}
export interface EquipmentInput {siteId:string;name:string;type:string;manufacturer?:string;model?:string;serialNumber?:string;capacityGallons?:number;fuelType:string;estimatedLevelPercent?:number;latitude?:number;longitude?:number;photoUrl?:string;accessNotes?:string;installDate?:string;}
export interface CustomerOrder {id:string;orderNumber:string;customerId:string;customerName:string;siteId:string;siteName:string;siteAddress:string;equipmentId:string;equipmentName:string;equipmentQrCode:string;fuelType:string;requestedGallons:number;fillPreference:string;requestedDate:string;deliveryWindow:string;instructions?:string;estimatedSubtotal:number;estimatedTaxesFees:number;estimatedTotal:number;status:string;driverJobId?:string;jobNumber?:string;driverName?:string;scheduledAt?:string;createdAt:string;updatedAt:string;}
export interface CustomerJob {id:string;customerOrderId?:string;jobNumber:string;driverId?:string;driverName?:string;vehicleId?:string;vehicleName?:string;vehicleUnitNumber?:string;siteId?:string;siteName:string;siteAddress:string;scheduledAt:string;targetGallons:number;deliveredGallons?:number;startingTotalizer?:number;endingTotalizer?:number;deliveryNotes?:string;fuelType:string;distanceMiles?:number;status:string;equipmentId?:string;equipmentName?:string;equipmentType?:string;equipmentQrCode?:string;siteContactName?:string;siteContactPhone?:string;deliveryInstructions?:string;safetyNote?:string;latitude?:number;longitude?:number;startedAt?:string;arrivedAt?:string;completedAt?:string;}
export interface CustomerOrderEstimateRequest {siteId:string;equipmentId:string;fuelType:string;requestedGallons:number;fillPreference:string;}
export interface CustomerOrderEstimate {pricePerGallon:number;estimatedSubtotal:number;estimatedTaxesFees:number;estimatedTotal:number;}
export interface CreateCustomerOrderRequest extends CustomerOrderEstimateRequest {requestedDate:string;deliveryWindow:string;instructions?:string;}
export interface CustomerInvoiceLineItem {id:string;description:string;fuelType:string;gallons:number;pricePerGallon:number;subtotal:number;tax:number;total:number;driverJobId:string;jobNumber:string;}
export interface CustomerInvoice {id:string;invoiceNumber:string;customerId:string;customerName:string;status:string;isOverdue:boolean;issueDate?:string;dueDate?:string;paidDate?:string;subtotal:number;taxTotal:number;total:number;notes?:string;lineItems:CustomerInvoiceLineItem[];createdAt:string;updatedAt:string;}
@Injectable({providedIn:'root'}) export class CustomerApiService {
  private readonly http=inject(HttpClient);
  getCurrentCustomer():Observable<CustomerProfile>{return this.http.get<ApiResponse<CustomerProfile>>(`${environment.apiUrl}/customer/me`).pipe(map(r=>r.data));}
  getSites():Observable<CustomerSite[]>{return this.http.get<ApiResponse<CustomerSite[]>>(`${environment.apiUrl}/customer/app/sites`).pipe(map(r=>r.data));}
  addSite(request:AddSiteRequest):Observable<CustomerSite>{return this.http.post<ApiResponse<CustomerSite>>(`${environment.apiUrl}/customer/app/sites`,request).pipe(map(r=>r.data));}
  getEquipment():Observable<CustomerEquipment[]>{return this.http.get<ApiResponse<CustomerEquipment[]>>(`${environment.apiUrl}/equipment/app`).pipe(map(r=>r.data));}
  getEquipmentById(id:string):Observable<CustomerEquipment>{return this.http.get<ApiResponse<CustomerEquipment>>(`${environment.apiUrl}/equipment/app/${id}`).pipe(map(r=>r.data));}
  createEquipment(request:EquipmentInput):Observable<CustomerEquipment>{return this.http.post<ApiResponse<CustomerEquipment>>(`${environment.apiUrl}/equipment/app`,request).pipe(map(r=>r.data));}
  updateEquipment(id:string,request:EquipmentInput&{status:string}):Observable<boolean>{return this.http.put<ApiResponse<boolean>>(`${environment.apiUrl}/equipment/app/${id}`,request).pipe(map(r=>r.data));}
  getOrders():Observable<CustomerOrder[]>{return this.http.get<ApiResponse<CustomerOrder[]>>(`${environment.apiUrl}/customer-order/app`).pipe(map(r=>r.data));}
  getJobs():Observable<CustomerJob[]>{return this.http.get<ApiResponse<CustomerJob[]>>(`${environment.apiUrl}/job/app`).pipe(map(r=>r.data));}
  getJob(id:string):Observable<CustomerJob>{return this.http.get<ApiResponse<CustomerJob>>(`${environment.apiUrl}/job/app/${id}`).pipe(map(r=>r.data));}
  getOrder(id:string):Observable<CustomerOrder>{return this.http.get<ApiResponse<CustomerOrder>>(`${environment.apiUrl}/customer-order/app/${id}`).pipe(map(r=>r.data));}
  estimateOrder(request:CustomerOrderEstimateRequest):Observable<CustomerOrderEstimate>{return this.http.post<ApiResponse<CustomerOrderEstimate>>(`${environment.apiUrl}/customer-order/app/estimate`,request).pipe(map(r=>r.data));}
  createOrder(request:CreateCustomerOrderRequest):Observable<CustomerOrder>{return this.http.post<ApiResponse<CustomerOrder>>(`${environment.apiUrl}/customer-order/app`,request).pipe(map(r=>r.data));}
  cancelOrder(id:string):Observable<boolean>{return this.http.post<ApiResponse<boolean>>(`${environment.apiUrl}/customer-order/app/${id}/cancel`,{}).pipe(map(r=>r.data));}
  getInvoices():Observable<CustomerInvoice[]>{return this.http.get<ApiResponse<CustomerInvoice[]>>(`${environment.apiUrl}/invoice/app`).pipe(map(r=>r.data));}
  getInvoice(id:string):Observable<CustomerInvoice>{return this.http.get<ApiResponse<CustomerInvoice>>(`${environment.apiUrl}/invoice/app/${id}`).pipe(map(r=>r.data));}
  payInvoice(id:string):Observable<CustomerInvoice>{return this.http.post<ApiResponse<CustomerInvoice>>(`${environment.apiUrl}/invoice/app/${id}/pay`,{}).pipe(map(r=>r.data));}
}
