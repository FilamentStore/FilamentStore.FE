import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { StorageService } from '@app/services/storage.service';
import { JwtService } from '@app/services/auth/jwt.service';
import { AuthResponse, CrmUser, WpUser } from '@app/models/auth.models';

const TOKEN_KEY = 'crm_token';
const USER_KEY = 'crm_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private jwt = inject(JwtService);

  private _currentUser = signal<CrmUser | null>(
    this.storage.get<CrmUser>(USER_KEY),
  );
  readonly currentUser = this._currentUser.asReadonly();

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.wpJsonUrl}/jwt-auth/v1/token`, {
        username,
        password,
      })
      .pipe(
        tap(res => {
          this.storage.set(TOKEN_KEY, res.token);
          const user: CrmUser = {
            email: res.user_email,
            name: res.user_display_name,
          };

          this.storage.set(USER_KEY, user);
          this._currentUser.set(user);
        }),
      );
  }

  validateToken(): Observable<{ code: string; data: { status: number } }> {
    return this.http.post<{ code: string; data: { status: number } }>(
      `${environment.wpJsonUrl}/jwt-auth/v1/token/validate`,
      {},
    );
  }

  getCurrentUser(): Observable<WpUser> {
    return this.http.get<WpUser>(`${environment.wpJsonUrl}/wp/v2/users/me`);
  }

  logout(): void {
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return this.storage.get<string>(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token) return false;

    return !this.jwt.isExpired(token);
  }
}
