import { HttpInterceptorFn } from '@angular/common/http';
export const customerAuthInterceptor: HttpInterceptorFn = (request,next) => {
  const token=localStorage.getItem('customer_access_token');
  return next(token?request.clone({setHeaders:{Authorization:`Bearer ${token}`}}):request);
};
