import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EmployeeAuthService } from '../services/employee-auth.service';

/**
 * Mirrors backend role policies for privileged admin pages.
 * Expected route data: { roles: ['admin', 'quanly'] }.
 */
export const employeeRoleGuard: CanActivateFn = (route) => {
  const auth = inject(EmployeeAuthService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const role = auth.role();

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/admin/login']);
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/admin']);
};
