import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatCheckboxModule,
  MatCheckboxChange,
} from '@angular/material/checkbox';
import { ProductsActions } from '../../../store/products.actions';
import {
  selectVariations,
  selectLoading,
} from '../../../store/products.selectors';
import { VariationRowComponent } from '../../variation-row/variation-row.component';
import {
  AttributeValue,
  ProductVariation,
} from '../../../models/product.models';

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
    MatCheckboxModule,
    VariationRowComponent,
  ],
  templateUrl: './tab-variations.component.html',
  styleUrl: './tab-variations.component.scss',
})
export class TabVariationsComponent {
  @Input({ required: true }) productId!: number;
  @Input() attributes: AttributeValue[] = [];

  private store = inject(Store);

  variations = this.store.selectSignal(selectVariations);
  loading = this.store.selectSignal(selectLoading);

  selectedIds = new Set<number>();

  get activeAttributes(): AttributeValue[] {
    return this.attributes.filter(a => a.options.length > 0);
  }

  generateVariations(): void {
    const active = this.activeAttributes;

    if (active.length === 0) return;

    const combinations = cartesianProduct(active.map(a => a.options));
    const existing = this.variations();

    combinations.forEach(combo => {
      const attrs = combo.map((option, i) => ({
        name: active[i].name,
        option,
      }));

      const alreadyExists = existing.some(
        v =>
          v.attributes.length === attrs.length &&
          v.attributes.every(a =>
            attrs.some(na => na.name === a.name && na.option === a.option),
          ),
      );

      if (!alreadyExists) {
        this.store.dispatch(
          ProductsActions.createVariation({
            productId: this.productId,
            variation: {
              attributes: attrs,
              regular_price: '0',
              sale_price: '',
              stock_quantity: 0,
              manage_stock: true,
              sku: '',
              status: 'publish',
              weight: '',
            },
          }),
        );
      }
    });
  }

  addEmptyVariation(): void {
    this.store.dispatch(
      ProductsActions.createVariation({
        productId: this.productId,
        variation: {
          attributes: [],
          regular_price: '0',
          sale_price: '',
          stock_quantity: 0,
          manage_stock: true,
          sku: '',
          status: 'publish',
          weight: '',
        },
      }),
    );
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
      this.variations().forEach(v => this.selectedIds.add(v.id));
    } else {
      this.selectedIds.clear();
    }
  }

  isAllSelected(): boolean {
    return (
      this.variations().length > 0 &&
      this.variations().every(v => this.selectedIds.has(v.id))
    );
  }

  enableAll(): void {
    this.bulkUpdateStatus('publish');
  }

  disableAll(): void {
    this.bulkUpdateStatus('private');
  }

  disableSelected(): void {
    this.selectedIds.forEach(id => {
      this.store.dispatch(
        ProductsActions.updateVariation({
          productId: this.productId,
          variationId: id,
          variation: { status: 'private' },
        }),
      );
    });
    this.selectedIds.clear();
  }

  private bulkUpdateStatus(status: 'publish' | 'private'): void {
    this.variations().forEach(v => {
      this.store.dispatch(
        ProductsActions.updateVariation({
          productId: this.productId,
          variationId: v.id,
          variation: { status },
        }),
      );
    });
  }

  trackById(_: number, v: ProductVariation): number {
    return v.id;
  }
}
