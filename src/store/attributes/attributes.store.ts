import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import {
  AttributesConfig,
  AttributesService,
} from '@app/services/tempService/attributes.service';
import { ColorValue, SimpleAttributeOption } from '@models/config.models';

const CACHE_KEY = 'fs_attributes_cache';

function readCache(): AttributesConfig {
  try {
    const raw = localStorage.getItem(CACHE_KEY);

    if (raw) return JSON.parse(raw) as AttributesConfig;
  } catch {}

  return { colors: [], simpleAttributes: {} };
}

@Injectable({ providedIn: 'root' })
export class AttributesStore {
  private service = inject(AttributesService);

  private readonly _cached = readCache();

  readonly colors = signal<ColorValue[]>(this._cached.colors);
  readonly simpleAttributes = signal<Record<string, SimpleAttributeOption[]>>(
    this._cached.simpleAttributes,
  );
  readonly loading = signal(false);

  init(): void {
    this.loading.set(true);
    this.service
      .loadConfig()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: config => {
          this.colors.set(config.colors ?? []);
          this.simpleAttributes.set(config.simpleAttributes ?? {});
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(config));
          } catch {}
        },
      });
  }
}
