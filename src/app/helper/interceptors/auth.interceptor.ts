import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@app/services/auth/auth.service';
import { JwtService } from '@app/services/auth/jwt.service';
import { selectToken } from '@store/auth/auth.selectors';
import { ROUTES } from '@app/constants/app.routes.const';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const auth = inject(AuthService);
  const jwt = inject(JwtService);
  const router = inject(Router);
  const token = store.selectSignal(selectToken)();

  const validToken = token && !jwt.isExpired(token) ? token : null;

  if (token && !validToken) {
    auth.logout();
  }

  const authReq = validToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${validToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || (error.status === 403 && validToken)) {
        auth.logout();
        router.navigate([
          `/${ROUTES.crm.root}/${ROUTES.crm.auth.root}/${ROUTES.crm.auth.login}`,
        ]);
      }

      return throwError(() => error);
    }),
  );
};
