import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttributeValue } from '@models/product.models';
import {
  selectColors,
  selectSimpleAttributes,
} from '@store/config/config.selectors';
import { ConfigActions } from '@store/config/config.actions';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';
import { AttributeConfig } from '@app/models/config.models';

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
export class TabAttributesComponent implements OnInit {
  @Input() attributes: AttributeValue[] = [];
  @Output() attributesChange = new EventEmitter<AttributeValue[]>();
  @Output() generateVariations = new EventEmitter<void>();

  private store = inject(Store);

  colors = this.store.selectSignal(selectColors);
  simpleAttributes = this.store.selectSignal(selectSimpleAttributes);
  configs = ATTRIBUTE_CONFIGS;

  ngOnInit(): void {
    this.store.dispatch(ConfigActions.loadConfig());
  }

  getConfiguredValues(config: AttributeConfig): string[] {
    if (config.type === 'color') {
      return this.colors().map(c => c.name);
    }

    return (this.simpleAttributes()[config.key] ?? []).map(o => o.name);
  }

  getSelectedOptions(attrName: string): string[] {
    return this.attributes.find(a => a.name === attrName)?.options ?? [];
  }

  isChecked(attrName: string, value: string): boolean {
    return this.getSelectedOptions(attrName).includes(value);
  }

  toggle(config: AttributeConfig, value: string): void {
    const current = this.getSelectedOptions(config.label);
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    const newAttrs = this.attributes.some(a => a.name === config.label)
      ? this.attributes.map(a =>
          a.name === config.label ? { ...a, options: updated } : a,
        )
      : [...this.attributes, { name: config.label, options: updated }];

    this.attributesChange.emit(newAttrs);
  }

  selectAll(config: AttributeConfig): void {
    const all = this.getConfiguredValues(config);
    const newAttrs = this.attributes.some(a => a.name === config.label)
      ? this.attributes.map(a =>
          a.name === config.label ? { ...a, options: [...all] } : a,
        )
      : [...this.attributes, { name: config.label, options: [...all] }];

    this.attributesChange.emit(newAttrs);
  }

  clearAll(config: AttributeConfig): void {
    this.attributesChange.emit(
      this.attributes.map(a =>
        a.name === config.label ? { ...a, options: [] } : a,
      ),
    );
  }

  hasAnySelected(): boolean {
    return this.attributes.some(a => a.options.length > 0);
  }

  getSelectedCount(config: AttributeConfig): number {
    return this.getSelectedOptions(config.label).length;
  }
}
