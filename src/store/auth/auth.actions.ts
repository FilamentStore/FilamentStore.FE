import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CrmUser } from '@app/models/auth.models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Success': props<{ token: string; user: CrmUser }>(),
    Logout: emptyProps(),
  },
});
