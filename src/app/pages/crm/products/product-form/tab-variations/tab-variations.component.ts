import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  MatCheckboxModule,
  MatCheckboxChange,
} from '@angular/material/checkbox';
import { VariationRowComponent } from '@pages/crm/products/variation-row/variation-row.component';
import { AttributeValue, ProductVariation } from '@models/product.models';
import { ColorValue, SimpleAttributeOption } from '@app/models/config.models';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';
import { VariationsService } from '@app/services/tempService/variations.service';

interface AttributeOption {
  label: string;
  value: string;
}

function cartesianProduct(arrays: string[][]): string[][] {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);

  return first.flatMap(option => restProduct.map(combo => [option, ...combo]));
}

@Component({
  selector: 'app-tab-variations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    VariationRowComponent,
  ],
  templateUrl: './tab-variations.component.html',
  styleUrl: './tab-variations.component.scss',
})
export class TabVariationsComponent implements OnChanges {
  @Input({ required: true }) productId!: number;
  @Input() skuPrefix = '';
  @Input() attributes: AttributeValue[] = [];
  @Input() colorsList: ColorValue[] = [];
  @Input() simpleAttributes: Record<string, SimpleAttributeOption[]> = {
    color_type: [],
    weight: [],
    diameter: [],
    spool: [],
  };

  private variationsService = inject(VariationsService);

  readonly variations = signal<ProductVariation[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  selectedIds = new Set<number>();
  showManualVariation = signal(false);
  selectedOptions = signal<Record<string, string>>({});

  get activeAttributes(): AttributeValue[] {
    return this.attributes.filter(attribute => attribute.options.length > 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId']?.currentValue) {
      this.loadVariations();
    }
  }

  generateVariations(): void {
    const active = this.activeAttributes;

    if (active.length === 0) return;

    const combinations = cartesianProduct(
      active.map(attribute => attribute.options),
    );
    const existing = this.variations();
    const requests = combinations
      .map(combo => {
        const attrs = combo.map((option, index) => ({
          name: active[index].name,
          option,
        }));

        const alreadyExists = existing.some(
          variation =>
            variation.attributes.length === attrs.length &&
            variation.attributes.every(attribute =>
              attrs.some(
                nextAttribute =>
                  nextAttribute.name === attribute.name &&
                  nextAttribute.option === attribute.option,
              ),
            ),
        );

        if (alreadyExists) {
          return null;
        }

        return this.variationsService.createVariation(this.productId, {
          attributes: attrs,
          sku: this.createVariationSku(attrs),
          regular_price: '0',
          sale_price: '',
          stock_quantity: 0,
          manage_stock: true,
          status: 'publish',
          weight: '',
        });
      })
      .filter(
        (
          request,
        ): request is ReturnType<VariationsService['createVariation']> =>
          !!request,
      );

    if (requests.length === 0) {
      return;
    }

    this.saving.set(true);
    forkJoin(requests)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: createdVariations => {
          this.variations.update(current => [...current, ...createdVariations]);
        },
      });
  }

  openAddVariation(): void {
    const active = this.activeAttributes;

    if (active.length === 0) {
      this.addEmptyVariation();

      return;
    }

    this.selectedOptions.set(
      Object.fromEntries(
        active.map(attribute => [attribute.name, attribute.options[0] ?? '']),
      ),
    );
    this.showManualVariation.set(true);
  }

  getOptionLabel(attrName: string, option: string): string {
    const options = this.getConfiguredOptions(attrName);

    return options.find(item => item.value === option)?.label ?? option;
  }

  getConfiguredOptions(attrName: string): AttributeOption[] {
    const config = ATTRIBUTE_CONFIGS.find(item => item.label === attrName);

    if (!config) {
      return [];
    }

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

  getManualOptions(attribute: AttributeValue): AttributeOption[] {
    const selectedValues = new Set(attribute.options);

    return this.getConfiguredOptions(attribute.name).filter(option =>
      selectedValues.has(option.value),
    );
  }

  addEmptyVariation(): void {
    this.saving.set(true);
    this.variationsService
      .createVariation(this.productId, {
        attributes: [],
        sku: this.createVariationSku([]),
        regular_price: '0',
        sale_price: '',
        stock_quantity: 0,
        manage_stock: true,
        status: 'publish',
        weight: '',
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: variation => {
          this.variations.update(current => [...current, variation]);
        },
      });
  }

  updateSelectedOption(name: string, option: string): void {
    this.selectedOptions.set({
      ...this.selectedOptions(),
      [name]: option,
    });
  }

  cancelManualVariation(): void {
    this.selectedOptions.set({});
    this.showManualVariation.set(false);
  }

  canCreateManualVariation(): boolean {
    return (
      this.activeAttributes.length > 0 &&
      this.activeAttributes.every(
        attribute => !!this.selectedOptions()[attribute.name],
      )
    );
  }

  createManualVariation(): void {
    if (!this.canCreateManualVariation()) {
      return;
    }

    const attrs = this.activeAttributes.map(attribute => ({
      name: attribute.name,
      option: this.selectedOptions()[attribute.name],
    }));

    this.saving.set(true);
    this.variationsService
      .createVariation(this.productId, {
        attributes: attrs,
        sku: this.createVariationSku(attrs),
        regular_price: '0',
        sale_price: '',
        stock_quantity: 0,
        manage_stock: true,
        status: 'publish',
        weight: '',
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: variation => {
          this.variations.update(current => [...current, variation]);
          this.selectedOptions.set({});
          this.showManualVariation.set(false);
        },
      });
  }

  onVariationSave(event: {
    variationId: number;
    variation: Partial<ProductVariation>;
  }): void {
    this.variationsService
      .updateVariation(this.productId, event.variationId, event.variation)
      .subscribe({
        next: updatedVariation => {
          this.variations.update(current =>
            current.map(variation =>
              variation.id === updatedVariation.id
                ? updatedVariation
                : variation,
            ),
          );
        },
      });
  }

  onVariationDelete(variationId: number): void {
    this.variationsService
      .deleteVariation(this.productId, variationId)
      .subscribe({
        next: () => {
          this.variations.update(current =>
            current.filter(variation => variation.id !== variationId),
          );
          this.selectedIds.delete(variationId);
        },
      });
  }

  toggleSelect(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
  }

  toggleAll(event: MatCheckboxChange): void {
    if (event.checked) {
      this.variations().forEach(variation =>
        this.selectedIds.add(variation.id),
      );
    } else {
      this.selectedIds.clear();
    }
  }

  isAllSelected(): boolean {
    return (
      this.variations().length > 0 &&
      this.variations().every(variation => this.selectedIds.has(variation.id))
    );
  }

  enableAll(): void {
    this.bulkUpdateStatus('publish');
  }

  disableAll(): void {
    this.bulkUpdateStatus('private');
  }

  disableSelected(): void {
    const selectedIds = Array.from(this.selectedIds);

    if (selectedIds.length === 0) {
      return;
    }

    this.saving.set(true);
    forkJoin(
      selectedIds.map(id =>
        this.variationsService.updateVariation(this.productId, id, {
          status: 'private',
        }),
      ),
    )
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: updatedVariations => {
          this.applyUpdatedVariations(updatedVariations);
          this.selectedIds.clear();
        },
      });
  }

  manualSku(): string {
    const attrs = this.activeAttributes.map(attribute => ({
      name: attribute.name,
      option: this.selectedOptions()[attribute.name],
    }));

    return this.createVariationSku(attrs);
  }

  trackById(_: number, variation: ProductVariation): number {
    return variation.id;
  }

  private bulkUpdateStatus(status: 'publish' | 'private'): void {
    const currentVariations = this.variations();

    if (currentVariations.length === 0) {
      return;
    }

    this.saving.set(true);
    forkJoin(
      currentVariations.map(variation =>
        this.variationsService.updateVariation(this.productId, variation.id, {
          status,
        }),
      ),
    )
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: updatedVariations => {
          this.applyUpdatedVariations(updatedVariations);
        },
      });
  }

  private loadVariations(): void {
    this.loading.set(true);
    this.variationsService
      .getVariations(this.productId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: variations => {
          this.variations.set(variations);
          this.selectedIds.clear();
        },
        error: () => {
          this.variations.set([]);
          this.selectedIds.clear();
        },
      });
  }

  private applyUpdatedVariations(updatedVariations: ProductVariation[]): void {
    const updatedMap = new Map(
      updatedVariations.map(variation => [variation.id, variation]),
    );

    this.variations.update(current =>
      current.map(variation => updatedMap.get(variation.id) ?? variation),
    );
  }

  private createVariationSku(
    attrs: { name: string; option: string }[],
  ): string {
    const attrPart = attrs
      .map(attribute => attribute.option.trim())
      .filter(Boolean)
      .join('-');

    const base =
      [this.skuPrefix, attrPart]
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0000-\u007F\p{L}\p{N}-]+/gu, '') || 'variation';

    const existingSkus = new Set(
      this.variations()
        .map(variation => variation.sku)
        .filter((sku): sku is string => !!sku),
    );

    let candidate = base;
    let suffix = 1;

    while (existingSkus.has(candidate)) {
      candidate = `${base}-${suffix++}`;
    }

    return candidate;
  }
}
