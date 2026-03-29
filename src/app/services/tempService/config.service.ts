import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@env/environment';
import { ColorValue, WcCategory } from '@models/config.models';

const STORAGE_KEY = 'fs_config_v2';

interface StoredConfig {
  colors: ColorValue[];
  simpleAttributes: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ─── Config (localStorage until API is ready) ─────────────────────
  loadConfig(): Observable<StoredConfig> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) return of(JSON.parse(raw) as StoredConfig);
    } catch {
      /* empty */
    }

    return of({ colors: [], simpleAttributes: {} });
  }

  // Called by effects after every mutation — persists current store state
  // When API is ready, replace with real HTTP calls
  saveConfig(): Observable<void> {
    // TODO: POST /config/save
    return of(undefined);
  }

  // ─── Categories ───────────────────────────────────────────────────
  getCategories(): Observable<WcCategory[]> {
    return this.http.get<WcCategory[]>(`${this.base}/config/categories`);
  }

  createCategory(name: string): Observable<WcCategory> {
    return this.http.post<WcCategory>(`${this.base}/config/categories`, {
      name,
    });
  }

  updateCategory(id: number, name: string): Observable<WcCategory> {
    return this.http.put<WcCategory>(`${this.base}/config/categories/${id}`, {
      name,
    });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/config/categories/${id}`);
  }
}
