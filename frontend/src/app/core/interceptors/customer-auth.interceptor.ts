import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const customerAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/v1/employee')) return next(req);
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  if (token && req.url.startsWith('/api/')) req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(req).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && token && !req.url.includes('/auth/login')) {
      auth.clearSession();
      if (req.url.includes('/account') || req.url.includes('/orders') || req.url.includes('/wishlist') || req.url.includes('/notifications') || req.url.includes('/cart')) {
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
    }
    return throwError(() => error);
  }));
};
