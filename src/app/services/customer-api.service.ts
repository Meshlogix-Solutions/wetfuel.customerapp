import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
interface ApiResponse<T>{data:T;message:string;statusCode:number;}
export interface CustomerSite { id:string;customerId:string;name:string;address:string;city:string;state:string;zipCode:string;latitude?:number;longitude?:number;contactName?:string;contactPhone?:string;equipmentCount:number;isDefault:boolean; }
export interface CustomerProfile { id:string;companyName:string;contactName:string;contactFirstName:string;contactLastName:string;contactEmail:string;contactPhone?:string;billingTerm:string;status:string;sites:CustomerSite[];totalDeliveries:number;totalGallonsDelivered:number;outstandingBalance:number; }
export interface AddSiteRequest { name:string;address:string;city:string;state:string;zipCode:string;latitude?:number;longitude?:number;contactName?:string;contactPhone?:string;isDefault:boolean; }
@Injectable({providedIn:'root'}) export class CustomerApiService {
  private readonly http=inject(HttpClient);
  bootstrap():Observable<CustomerProfile>{return this.http.get<ApiResponse<CustomerProfile>>(`${environment.apiUrl}/customer/app/bootstrap`).pipe(map(r=>r.data));}
  addSite(request:AddSiteRequest):Observable<CustomerSite>{return this.http.post<ApiResponse<CustomerSite>>(`${environment.apiUrl}/customer/app/sites`,request).pipe(map(r=>r.data));}
}
