import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';

import { ColorAttributeTabComponent } from './tabs/color-attribute-tab/color-attribute-tab';
import { MaterialAttributeTabComponent } from './tabs/material-attribute-tab/material-attribute-tab';
import { WeightAttributeTabComponent } from './tabs/weight-attribute-tab/weight-attribute-tab';
import { DiameterAttributeTabComponent } from './tabs/diameter-attribute-tab/diameter-attribute-tab';
import { SpoolAttributeTabComponent } from './tabs/spool-attribute-tab/spool-attribute-tab';
import { ColorValue, SimpleAttributeOption } from '@app/models/config.models';
import {
  AttributesConfig,
  AttributesService,
} from '@app/services/tempService/attributes.service';

@Component({
  selector: 'app-attributes-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    ColorAttributeTabComponent,
    MaterialAttributeTabComponent,
    WeightAttributeTabComponent,
    DiameterAttributeTabComponent,
    SpoolAttributeTabComponent,
  ],
  templateUrl: './attributes-tab.component.html',
  styleUrl: './attributes-tab.component.scss',
})
export class AttributesTabComponent implements OnInit {
  private readonly attributesService = inject(AttributesService);

  readonly colors = signal<ColorValue[]>([]);
  readonly simpleAttributes = signal<Record<string, SimpleAttributeOption[]>>(
    {},
  );
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly totalOptions = computed(() => {
    const simple = Object.values(this.simpleAttributes()).reduce(
      (sum, values) => sum + values.length,
      0,
    );

    return this.colors().length + simple;
  });

  ngOnInit(): void {
    this.loadConfig();
  }

  addColor(color: ColorValue): void {
    const current = this.getCurrentConfig();

    if (current.colors.some(item => item.slug === color.slug)) {
      return;
    }

    this.save(this.attributesService.addColor(current, color));
  }

  updateColor(payload: { oldSlug: string; color: ColorValue }): void {
    this.save(
      this.attributesService.updateColor(
        this.getCurrentConfig(),
        payload.oldSlug,
        payload.color,
      ),
    );
  }

  removeColor(slug: string): void {
    this.save(
      this.attributesService.removeColor(this.getCurrentConfig(), slug),
    );
  }

  addValue(payload: { key: string; option: SimpleAttributeOption }): void {
    const current = this.getCurrentConfig();

    if (
      (current.simpleAttributes[payload.key] ?? []).some(
        item => item.slug === payload.option.slug,
      )
    ) {
      return;
    }

    this.save(
      this.attributesService.addValue(current, payload.key, payload.option),
    );
  }

  updateValue(payload: {
    key: string;
    oldSlug: string;
    option: SimpleAttributeOption;
  }): void {
    this.save(
      this.attributesService.updateValue(
        this.getCurrentConfig(),
        payload.key,
        payload.oldSlug,
        payload.option,
      ),
    );
  }

  removeValue(payload: { key: string; slug: string }): void {
    this.save(
      this.attributesService.removeValue(
        this.getCurrentConfig(),
        payload.key,
        payload.slug,
      ),
    );
  }

  countFor(key: string): number {
    if (key === 'color') {
      return this.colors().length;
    }

    return this.simpleAttributes()[key]?.length ?? 0;
  }

  private loadConfig(): void {
    this.loading.set(true);
    this.attributesService
      .loadConfig()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: config => this.applyConfig(config),
        error: () => this.applyConfig({ colors: [], simpleAttributes: {} }),
      });
  }

  private save(request: ReturnType<AttributesService['saveConfig']>): void {
    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: config => this.applyConfig(config),
    });
  }

  private getCurrentConfig(): AttributesConfig {
    return {
      colors: this.colors(),
      simpleAttributes: this.simpleAttributes(),
    };
  }

  private applyConfig(config: AttributesConfig): void {
    this.colors.set(config.colors);
    const rest = { ...config.simpleAttributes };

    delete rest['material'];

    this.simpleAttributes.set({
      ...rest,
      color_type:
        config.simpleAttributes['color_type'] ??
        config.simpleAttributes['material'] ??
        [],
      weight: config.simpleAttributes['weight'] ?? [],
      diameter: config.simpleAttributes['diameter'] ?? [],
      spool: config.simpleAttributes['spool'] ?? [],
    });
  }
}
