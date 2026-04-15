import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ColorValue, SimpleAttributeOption } from '@models/config.models';

export interface AttributesConfig {
  colors: ColorValue[];
  simpleAttributes: Record<string, SimpleAttributeOption[]>;
}

@Injectable({ providedIn: 'root' })
export class AttributesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/config/attributes`;

  loadConfig(): Observable<AttributesConfig> {
    return this.http.get<AttributesConfig>(this.base);
  }

  saveConfig(config: AttributesConfig): Observable<AttributesConfig> {
    return this.http.post<AttributesConfig>(this.base, config);
  }

  addColor(
    config: AttributesConfig,
    color: ColorValue,
  ): Observable<AttributesConfig> {
    return this.saveConfig({
      ...config,
      colors: [...config.colors, color],
    });
  }

  updateColor(
    config: AttributesConfig,
    oldSlug: string,
    color: ColorValue,
  ): Observable<AttributesConfig> {
    return this.saveConfig({
      ...config,
      colors: config.colors.map(item => (item.slug === oldSlug ? color : item)),
    });
  }

  removeColor(
    config: AttributesConfig,
    slug: string,
  ): Observable<AttributesConfig> {
    return this.saveConfig({
      ...config,
      colors: config.colors.filter(item => item.slug !== slug),
    });
  }

  addValue(
    config: AttributesConfig,
    key: string,
    option: SimpleAttributeOption,
  ): Observable<AttributesConfig> {
    return this.saveConfig({
      ...config,
      simpleAttributes: {
        ...config.simpleAttributes,
        [key]: [...(config.simpleAttributes[key] ?? []), option],
      },
    });
  }

  updateValue(
    config: AttributesConfig,
    key: string,
    oldSlug: string,
    option: SimpleAttributeOption,
  ): Observable<AttributesConfig> {
    return this.saveConfig({
      ...config,
      simpleAttributes: {
        ...config.simpleAttributes,
        [key]: (config.simpleAttributes[key] ?? []).map(item =>
          item.slug === oldSlug ? option : item,
        ),
      },
    });
  }

  removeValue(
    config: AttributesConfig,
    key: string,
    slug: string,
  ): Observable<AttributesConfig> {
    return this.saveConfig({
      ...config,
      simpleAttributes: {
        ...config.simpleAttributes,
        [key]: (config.simpleAttributes[key] ?? []).filter(
          item => item.slug !== slug,
        ),
      },
    });
  }
}
