import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthUser } from '@app/models/auth.models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Success': props<{ token: string; user: AuthUser }>(),
    Logout: emptyProps(),
  },
});
