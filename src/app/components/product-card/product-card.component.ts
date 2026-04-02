import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product, ProductVariation } from '@app/models/product.models';
import { SimpleAttributeOption } from '@app/models/config.models';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';
import {
  selectAttributeColors,
  selectAttributeSimpleAttributes,
} from '@store/attributes/attributes.selectors';

export interface ProductCardEvent {
  product: Product;
  variation: ProductVariation;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  variation = input.required<ProductVariation>();
  isFavorite = input<boolean>(false);

  addToCart = output<ProductCardEvent>();
  toggleFavorite = output<ProductCardEvent>();

  private store = inject(Store);
  private router = inject(Router);

  private colors = toSignal(this.store.select(selectAttributeColors), {
    initialValue: [],
  });
  private simpleAttributes = toSignal(
    this.store.select(selectAttributeSimpleAttributes),
    { initialValue: {} as Record<string, SimpleAttributeOption[]> },
  );

  readonly image = computed(() => {
    const v = this.variation();
    const p = this.product();

    return v.image ?? p.images?.[0] ?? null;
  });

  readonly currentPrice = computed(() => {
    const { sale_price, regular_price } = this.variation();

    return sale_price && sale_price !== '0' && sale_price !== regular_price
      ? sale_price
      : regular_price;
  });

  readonly oldPrice = computed(() => {
    const { sale_price, regular_price } = this.variation();

    return sale_price && sale_price !== '0' && sale_price !== regular_price
      ? regular_price
      : null;
  });

  readonly displayName = computed(() => {
    const name = this.product().name;
    const parts = this.variation().attributes.map(a =>
      this.resolveOptionName(a.name, a.option),
    );

    return parts.length ? `${name} ${parts.join(' ')}` : name;
  });

  readonly stockStatus = computed(() => {
    const qty = this.variation().stock_quantity;

    if (qty === 0) return 'out';
    if (qty <= 5) return 'low';

    return 'in';
  });

  resolveOptionName(attrName: string, slug: string): string {
    const config = ATTRIBUTE_CONFIGS.find(c => c.label === attrName);

    if (!config) return slug;

    if (config.type === 'color') {
      return this.colors().find(c => c.slug === slug)?.name ?? slug;
    }

    return (
      this.simpleAttributes()[config.key]?.find(o => o.slug === slug)?.name ??
      slug
    );
  }

  navigateToDetail(): void {
    void this.router.navigate(['/product', this.product().id]);
  }

  onAddToCart(): void {
    this.addToCart.emit({
      product: this.product(),
      variation: this.variation(),
    });
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit({
      product: this.product(),
      variation: this.variation(),
    });
  }
}
