import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductVariation } from '@app/models/product.models';

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

  readonly stockStatus = computed(() => {
    const qty = this.variation().stock_quantity;

    if (qty === 0) return 'out';
    if (qty <= 5) return 'low';

    return 'in';
  });

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
