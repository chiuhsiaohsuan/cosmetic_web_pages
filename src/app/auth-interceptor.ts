import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const handledRequest = req.clone({
    withCredentials: true
  });

  return next(handledRequest).pipe(

    catchError((error) => {

      const message =
        error?.error?.message ||
        error?.message ||
        '';

      const isMeRequest = req.url.includes('/api/me');

      const isLogoutRequest = req.url.includes('/api/logout');

      // -----------------------------
      // Session 過期
      // -----------------------------
      if (
        error?.status === 401 &&
        !isMeRequest &&
        !isLogoutRequest
      ) {

        authService.clearLoginState();

        router.navigate(['/login']);
      }

      // -----------------------------
      // 帳號被停權
      // -----------------------------
      if (
        error?.status === 403 &&
        (
          error?.headers?.get('X-Account-Disabled') === 'true' ||
          message.includes('帳號已停權') ||
          message.includes('disabled')
        )
      ) {

        authService.clearLoginState();

        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};