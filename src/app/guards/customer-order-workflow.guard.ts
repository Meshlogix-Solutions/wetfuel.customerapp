import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { CustomerStateService } from '../services/customer-state.service';

export const customerOrderWorkflowGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const state = inject(CustomerStateService);
  const router = inject(Router);
  const step = route.data['orderStep'] as 'details' | 'schedule' | 'review';
  if (state.canAccessOrderStep(step)) return true;
  if (step === 'review' && state.canAccessOrderStep('schedule')) {
    return router.createUrlTree(['/schedule-delivery']);
  }
  if (step !== 'details' && state.canAccessOrderStep('details')) {
    return router.createUrlTree(['/order-details']);
  }
  return router.createUrlTree(['/new-order']);
};
