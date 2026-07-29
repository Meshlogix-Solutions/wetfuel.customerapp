import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';

// splash/login are entry routes with no auth check of their own - without this, a customer
// with a perfectly valid persisted session still has to click through both screens on
// every app open. Send them straight to home instead.
export const redirectIfAuthenticatedGuard: CanActivateFn = async () => {
  const auth = inject(CustomerAuthService);
  const router = inject(Router);
  return (await auth.hasValidSession()) ? router.createUrlTree(['/home']) : true;
};
