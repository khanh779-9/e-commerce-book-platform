import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { EmployeeAuthService } from '../services/employee-auth.service';

/**
 * Attaches the employee JWT to requests hitting the internal API surface
 * (`/api/v1/employee/**`) and forces a redirect to the internal login page
 * when the server rejects the token (401). Customer-facing endpoints are
 * left untouched so the two sessions never collide.
 */
export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(EmployeeAuthService);
  const router = inject(Router);

  const isEmployeeEndpoint = req.url.includes('/api/v1/employee');

  if (isEmployeeEndpoint) {
    const token = auth.getToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          auth.logout();
          router.navigate(['/admin/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
