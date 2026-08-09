import { AuthUser } from '@app/models/auth.models';

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}
