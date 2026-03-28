import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState } from './auth.state';

const initialState: AuthState = {
  token: localStorage.getItem('crm_token'),
  user: JSON.parse(localStorage.getItem('crm_user') ?? 'null'),
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (_state, { token, user }) => ({ token, user })),
  on(AuthActions.logout, () => ({ token: null, user: null })),
);
