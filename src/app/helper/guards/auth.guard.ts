import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '@app/services/auth/auth.service';
import { ROUTES } from '@app/constants/app.routes.const';
import { selectCurrentUser } from '@store/auth/auth.selectors';

const LOGIN_PATH = `/${ROUTES.crm.root}/${ROUTES.crm.auth.root}/${ROUTES.crm.auth.login}`;

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const store = inject(Store);
  const router = inject(Router);

  const user = store.selectSignal(selectCurrentUser)();

  if (auth.isLoggedIn() && user?.isAdmin) return true;

  router.navigate([LOGIN_PATH]);

  return false;
};
