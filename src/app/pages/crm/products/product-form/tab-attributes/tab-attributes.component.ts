import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatCheckboxModule,
  MatCheckboxChange,
} from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AttributeValue, ProductVariation } from '@models/product.models';
import {
  AttributeConfig,
  ColorValue,
  SimpleAttributeOption,
} from '@app/models/config.models';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';

@Component({
  selector: 'app-attr-block-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Видалення неможливе</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <ul style="margin: 8px 0; padding-left: 20px;">
        @for (label of data.labels; track label) {
          <li>
            <code>{{ label }}</code>
          </li>
        }
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>
        Зрозуміло
      </button>
    </mat-dialog-actions>
  `,
})
export class AttrBlockDialogComponent {
  readonly data = inject<{ message: string; labels: string[] }>(
    MAT_DIALOG_DATA,
  );
}

interface AttributeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-tab-attributes',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './tab-attributes.component.html',
  styleUrl: './tab-attributes.component.scss',
})
export class TabAttributesComponent {
  @Input() attributes: AttributeValue[] = [];
  @Input() colorsList: ColorValue[] = [];
  @Input() simpleAttributes: Record<string, SimpleAttributeOption[]> = {
    color_type: [],
    weight: [],
    diameter: [],
    spool: [],
  };
  @Input() variations: ProductVariation[] = [];
  @Input() isEditMode = false;
  @Output() attributesChange = new EventEmitter<AttributeValue[]>();
  @Output() generateVariations = new EventEmitter<void>();

  private dialog = inject(MatDialog);
  readonly configs = ATTRIBUTE_CONFIGS;

  getConfiguredValues(config: AttributeConfig): AttributeOption[] {
    if (config.type === 'color') {
      return this.colorsList.map(color => ({
        label: color.name,
        value: color.slug,
      }));
    }

    return (this.simpleAttributes[config.key] ?? []).map(option => ({
      label: option.name,
      value: option.slug,
    }));
  }

  getSelectedOptions(attrName: string): string[] {
    return (
      this.attributes.find(attribute => attribute.name === attrName)?.options ??
      []
    );
  }

  isChecked(attrName: string, value: string): boolean {
    return this.getSelectedOptions(attrName).includes(value);
  }

  toggle(
    config: AttributeConfig,
    value: string,
    event: MatCheckboxChange,
  ): void {
    const current = this.getSelectedOptions(config.label);
    const isRemoving = !event.checked;

    if (isRemoving && this.isEditMode) {
      const blocked = this.getBlockedVariationLabels(config.label, [value]);

      if (blocked.length > 0) {
        // eslint-disable-next-line no-param-reassign
        event.source.checked = true;
        this.openBlockDialog(
          `Значення "${value}" використовується у ${blocked.length} варіації(ях). Спочатку видаліть ці варіації:`,
          blocked,
        );

        return;
      }
    }

    const updated = isRemoving
      ? current.filter(option => option !== value)
      : [...current, value];

    const newAttributes = this.attributes.some(
      attribute => attribute.name === config.label,
    )
      ? this.attributes.map(attribute =>
          attribute.name === config.label
            ? { ...attribute, options: updated }
            : attribute,
        )
      : [...this.attributes, { name: config.label, options: updated }];

    this.attributesChange.emit(newAttributes);
  }

  selectAll(config: AttributeConfig): void {
    const all = this.getConfiguredValues(config).map(option => option.value);
    const newAttributes = this.attributes.some(
      attribute => attribute.name === config.label,
    )
      ? this.attributes.map(attribute =>
          attribute.name === config.label
            ? { ...attribute, options: [...all] }
            : attribute,
        )
      : [...this.attributes, { name: config.label, options: [...all] }];

    this.attributesChange.emit(newAttributes);
  }

  clearAll(config: AttributeConfig): void {
    if (this.isEditMode) {
      const current = this.getSelectedOptions(config.label);
      const blocked = this.getBlockedVariationLabels(config.label, current);

      if (blocked.length > 0) {
        this.openBlockDialog(
          `Атрибут "${config.label}" використовується у ${blocked.length} варіації(ях). Спочатку видаліть ці варіації:`,
          blocked,
        );

        return;
      }
    }

    this.attributesChange.emit(
      this.attributes.map(attribute =>
        attribute.name === config.label
          ? { ...attribute, options: [] }
          : attribute,
      ),
    );
  }

  private getBlockedVariationLabels(
    attrName: string,
    valuesToRemove: string[],
  ): string[] {
    const removeSet = new Set(valuesToRemove);

    return this.variations
      .filter(v =>
        v.attributes.some(a => a.name === attrName && removeSet.has(a.option)),
      )
      .map(v => v.sku || `Варіація #${v.id}`);
  }

  private openBlockDialog(message: string, labels: string[]): void {
    this.dialog.open(AttrBlockDialogComponent, {
      data: { message, labels },
      width: '420px',
    });
  }

  hasAnySelected(): boolean {
    return this.attributes.some(attribute => attribute.options.length > 0);
  }

  hasAllSelected(): boolean {
    return this.configs.every(config => this.getSelectedCount(config) > 0);
  }

  getSelectedCount(config: AttributeConfig): number {
    return this.getSelectedOptions(config.label).length;
  }
}
