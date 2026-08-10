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

      if (
        error?.status === 401 ||
        (
          error?.status === 403 &&
          (
            error?.headers?.get('X-Account-Disabled') === 'true' ||
            message.includes('帳號已停權') ||
            message.includes('disabled')
          )
        )
      ) {

        authService.logout();

        router.navigate(['/login']);

      }

      return throwError(() => error);

    })

  );

};