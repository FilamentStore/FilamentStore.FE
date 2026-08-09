import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '@app/services/auth/auth.service';
import { ROUTES } from '@app/constants/app.routes.const';
import { selectCurrentUser } from '@store/auth/auth.selectors';

const LOGIN_PATH = `/${ROUTES.crm.root}/${ROUTES.crm.auth.root}/${ROUTES.crm.auth.login}`;
const DASHBOARD_PATH = `/${ROUTES.crm.root}/${ROUTES.crm.dashboard}`;

export const customerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const store = inject(Store);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate([LOGIN_PATH]);

    return false;
  }

  const user = store.selectSignal(selectCurrentUser)();

  if (user?.isAdmin) {
    router.navigate([DASHBOARD_PATH]);

    return false;
  }

  return true;
};
