export interface AuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface WpUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface CrmUser {
  email: string;
  name: string;
}
