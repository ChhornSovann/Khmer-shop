import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.accessToken();

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
        const refresh$ = auth.refreshAccessToken();
        if (refresh$) {
          return refresh$.pipe(
            switchMap(res => {
              const retried = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
              return next(retried);
            }),
            catchError(() => { auth.logout(); return throwError(() => err); })
          );
        }
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
