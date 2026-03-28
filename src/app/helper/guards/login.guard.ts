import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';
import { ROUTES } from '@app/constants/app.routes.const';

const DASHBOARD_PATH = `/${ROUTES.crm.root}/${ROUTES.crm.dashboard}`;

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    router.navigate([DASHBOARD_PATH]);

    return false;
  }

  return true;
};
