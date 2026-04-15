import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
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
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  variation = input.required<ProductVariation>();
  isFavorite = input<boolean>(false);
  isInCart = input<boolean>(false);

  addToCart = output<ProductCardEvent>();
  toggleFavorite = output<ProductCardEvent>();
  readonly cartAnimating = signal(false);
  readonly favAnimating = signal(false);

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

  private readonly isOnSale = computed(() => {
    const { sale_price, regular_price } = this.variation();

    return !!(sale_price && sale_price !== '0' && sale_price !== regular_price);
  });

  readonly currentPrice = computed(() => {
    const { sale_price, regular_price } = this.variation();

    return this.isOnSale() ? sale_price! : regular_price;
  });

  readonly oldPrice = computed(() =>
    this.isOnSale() ? this.variation().regular_price : null,
  );

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

  readonly colorAttr = computed(() => {
    const attr = this.variation().attributes.find(a => a.name === 'Колір');

    if (!attr) return null;

    return this.colors().find(c => c.slug === attr.option) ?? null;
  });

  readonly colorSwatchBg = computed(() => {
    const hex = this.colorAttr()?.hex;

    if (!hex?.length) return null;
    if (hex.length === 1) return hex[0];

    const step = 100 / hex.length;
    const stops = hex
      .flatMap((h, i) => [`${h} ${i * step}%`, `${h} ${(i + 1) * step}%`])
      .join(', ');

    return `linear-gradient(135deg, ${stops})`;
  });

  readonly diameterAttr = computed(() => {
    const attr = this.variation().attributes.find(a => a.name === 'Діаметр');

    if (!attr) return null;

    return (
      this.simpleAttributes()['diameter']?.find(o => o.slug === attr.option)
        ?.name ?? attr.option
    );
  });

  readonly weightAttr = computed(() => {
    const attr = this.variation().attributes.find(a => a.name === 'Вага');

    if (!attr) return null;

    return (
      this.simpleAttributes()['weight']?.find(o => o.slug === attr.option)
        ?.name ?? attr.option
    );
  });

  readonly discountPercent = computed(() => {
    const current = parseFloat(this.currentPrice());
    const old = parseFloat(this.oldPrice() ?? '0');

    if (!old || old <= current) return null;

    return Math.round((1 - current / old) * 100);
  });

  private resolveOptionName(attrName: string, slug: string): string {
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
    void this.router.navigate(['/product', this.product().id], {
      queryParams: { variationId: this.variation().id },
    });
  }

  onCartClick(): void {
    if (this.isInCart()) {
      void this.router.navigate(['/cart']);
    } else {
      this.cartAnimating.set(true);
      setTimeout(() => this.cartAnimating.set(false), 650);
      this.addToCart.emit({
        product: this.product(),
        variation: this.variation(),
      });
    }
  }

  onAddToCart(): void {
    this.cartAnimating.set(true);
    setTimeout(() => this.cartAnimating.set(false), 650);
    this.addToCart.emit({
      product: this.product(),
      variation: this.variation(),
    });
  }

  onToggleFavorite(): void {
    this.favAnimating.set(true);
    setTimeout(() => this.favAnimating.set(false), 850);
    this.toggleFavorite.emit({
      product: this.product(),
      variation: this.variation(),
    });
  }
}
