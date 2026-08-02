import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '@app/services/auth/auth.service';
import { ROUTES } from '@app/constants/app.routes.const';
import { selectCurrentUser } from '@store/auth/auth.selectors';

const DASHBOARD_PATH = `/${ROUTES.crm.root}/${ROUTES.crm.dashboard}`;
const ACCOUNT_PATH = `/${ROUTES.site.account}`;

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const store = inject(Store);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const user = store.selectSignal(selectCurrentUser)();

    router.navigate([user?.isAdmin ? DASHBOARD_PATH : ACCOUNT_PATH]);

    return false;
  }

  return true;
};
