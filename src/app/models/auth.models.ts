export interface AuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface Address {
  id: string;
  label: string;
  city: string;
  warehouse: string;
  isDefault: boolean;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
  phone: string;
  certif: string;
  addresses: Address[];
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse {
  user: AuthUser;
  token: string | null;
}
