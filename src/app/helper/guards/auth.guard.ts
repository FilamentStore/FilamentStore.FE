import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '@app/services/auth/auth.service';
import { ROUTES } from '@app/constants/app.routes.const';

const LOGIN_PATH = `/${ROUTES.crm.root}/${ROUTES.crm.auth.root}/${ROUTES.crm.auth.login}`;

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate([LOGIN_PATH]);

    return false;
  }

  return auth.validateToken().pipe(
    map(() => true),
    catchError(() => {
      auth.logout();
      router.navigate([LOGIN_PATH]);

      return of(false);
    }),
  );
};
