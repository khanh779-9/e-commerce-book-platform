import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EmployeeAuthService } from '../services/employee-auth.service';

/**
 * Blocks access to internal (employee/admin) routes unless an active
 * employee session exists. Redirects to /admin/login otherwise.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(EmployeeAuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/admin/login']);
};
