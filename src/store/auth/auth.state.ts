import { CrmUser } from '@app/models/auth.models';

export interface AuthState {
  token: string | null;
  user: CrmUser | null;
}
