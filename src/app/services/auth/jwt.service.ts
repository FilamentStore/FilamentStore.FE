import { Injectable } from '@angular/core';

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class JwtService {
  decode<T extends JwtPayload>(token: string): T | null {
    try {
      const payload = token.split('.')[1];

      return JSON.parse(atob(payload)) as T;
    } catch {
      return null;
    }
  }

  isExpired(token: string): boolean {
    const payload = this.decode(token);

    if (!payload?.exp) return true;

    return Date.now() >= payload.exp * 1000;
  }

  getExpiry(token: string): Date | null {
    const payload = this.decode(token);

    if (!payload?.exp) return null;

    return new Date(payload.exp * 1000);
  }
}
