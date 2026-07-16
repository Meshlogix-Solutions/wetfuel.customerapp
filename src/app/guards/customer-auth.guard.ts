import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';
export const customerAuthGuard: CanActivateChildFn = async () => {
  const auth=inject(CustomerAuthService),router=inject(Router);
  return await auth.hasValidSession() || router.createUrlTree(['/login']);
};
