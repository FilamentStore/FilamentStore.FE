import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttributeValue } from '@models/product.models';
import {
  AttributeConfig,
  ColorValue,
  SimpleAttributeOption,
} from '@app/models/config.models';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';

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
  ],
  templateUrl: './tab-attributes.component.html',
  styleUrl: './tab-attributes.component.scss',
})
export class TabAttributesComponent {
  @Input() attributes: AttributeValue[] = [];
  @Input() colorsList: ColorValue[] = [];
  @Input() simpleAttributes: Record<string, SimpleAttributeOption[]> = {
    material: [],
    weight: [],
    diameter: [],
    spool: [],
  };
  @Output() attributesChange = new EventEmitter<AttributeValue[]>();
  @Output() generateVariations = new EventEmitter<void>();

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

  toggle(config: AttributeConfig, value: string): void {
    const current = this.getSelectedOptions(config.label);
    const updated = current.includes(value)
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
    this.attributesChange.emit(
      this.attributes.map(attribute =>
        attribute.name === config.label
          ? { ...attribute, options: [] }
          : attribute,
      ),
    );
  }

  hasAnySelected(): boolean {
    return this.attributes.some(attribute => attribute.options.length > 0);
  }

  getSelectedCount(config: AttributeConfig): number {
    return this.getSelectedOptions(config.label).length;
  }
}
