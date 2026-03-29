import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ColorValue,
  SimpleAttributeOption,
  WcCategory,
} from '@models/config.models';

export interface StoredConfig {
  colors: ColorValue[];
  simpleAttributes: Record<string, SimpleAttributeOption[]>;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ─── Attributes config ────────────────────────────────────────────
  loadConfig(): Observable<StoredConfig> {
    return this.http.get<StoredConfig>(`${this.base}/config/attributes`);
  }

  saveConfig(config: StoredConfig): Observable<StoredConfig> {
    return this.http.post<StoredConfig>(
      `${this.base}/config/attributes`,
      config,
    );
  }

  // ─── Categories ───────────────────────────────────────────────────
  getCategories(): Observable<WcCategory[]> {
    return this.http.get<WcCategory[]>(`${this.base}/config/categories`);
  }

  createCategory(name: string, slug: string): Observable<WcCategory> {
    return this.http.post<WcCategory>(`${this.base}/config/categories`, {
      name,
      slug,
    });
  }

  updateCategory(
    id: number,
    name: string,
    slug: string,
  ): Observable<WcCategory> {
    return this.http.put<WcCategory>(`${this.base}/config/categories/${id}`, {
      name,
      slug,
    });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/config/categories/${id}`);
  }
}
