import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from '@env/environment';
import { StorageService } from '@app/services/storage.service';
import { JwtService } from '@app/services/auth/jwt.service';
import {
  AuthResponse,
  AuthUser,
  RegisterRequest,
  RegisterResponse,
} from '@app/models/auth.models';
import { AuthActions } from '@store/auth/auth.actions';
import { selectToken } from '@store/auth/auth.selectors';

import { STORAGE_KEYS } from '@constants/storage-keys.const';

const TOKEN_KEY = STORAGE_KEYS.crm.token;
const USER_KEY = STORAGE_KEYS.crm.user;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private jwt = inject(JwtService);
  private store = inject(Store);

  readonly token = this.store.selectSignal(selectToken);

  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${environment.wpJsonUrl}/jwt-auth/v1/token`, {
        username,
        password,
      })
      .pipe(
        switchMap(res =>
          this.me(res.token).pipe(
            tap(user => this.setSession(res.token, user)),
          ),
        ),
      );
  }

  register(body: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${environment.apiUrl}/auth/register`, body)
      .pipe(
        tap(res => {
          if (res.token) {
            this.setSession(res.token, res.user);
          }
        }),
      );
  }

  me(token?: string): Observable<AuthUser> {
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<AuthUser>(`${environment.apiUrl}/me`, { headers });
  }

  validateToken(): Observable<{ code: string; data: { status: number } }> {
    return this.http.post<{ code: string; data: { status: number } }>(
      `${environment.wpJsonUrl}/jwt-auth/v1/token/validate`,
      {},
    );
  }

  logout(): void {
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this.store.dispatch(AuthActions.logout());
  }

  isLoggedIn(): boolean {
    const token = this.token();

    if (!token) return false;

    return !this.jwt.isExpired(token);
  }

  private setSession(token: string, user: AuthUser): void {
    this.storage.set(TOKEN_KEY, token);
    this.storage.set(USER_KEY, user);
    this.store.dispatch(AuthActions.loginSuccess({ token, user }));
  }
}
