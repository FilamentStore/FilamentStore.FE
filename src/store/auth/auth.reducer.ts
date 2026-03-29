import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState } from './auth.state';
import { STORAGE_KEYS } from '@constants/storage-keys.const';

const initialState: AuthState = {
  token: JSON.parse(localStorage.getItem(STORAGE_KEYS.crm.token) ?? 'null'),
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.crm.user) ?? 'null'),
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (_state, { token, user }) => ({ token, user })),
  on(AuthActions.logout, () => ({ token: null, user: null })),
);
