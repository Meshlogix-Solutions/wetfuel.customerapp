import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { CustomerAuthService } from '../services/customer-auth.service';
export const customerAuthInterceptor: HttpInterceptorFn = (request,next) => {
  const auth=inject(CustomerAuthService);
  const token=localStorage.getItem('customer_access_token');
  return next(token?request.clone({setHeaders:{Authorization:`Bearer ${token}`}}):request).pipe(
    catchError(error=>{
      if(error.status===401)auth.expireSession();
      return throwError(()=>error);
    })
  );
};
