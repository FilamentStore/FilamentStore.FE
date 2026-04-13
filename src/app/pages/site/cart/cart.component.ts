import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';

import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';
import { ColorValue, SimpleAttributeOption } from '@app/models/config.models';
import { Product, ProductVariation } from '@app/models/product.models';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';
import {
  selectAttributeColors,
  selectAttributeSimpleAttributes,
} from '@store/attributes/attributes.selectors';
import { selectCartEntries } from '@store/cart/cart.selectors';
import { CartActions } from '@store/cart/cart.actions';

interface CartCard {
  product: Product;
  variation: ProductVariation;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbComponent,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private store = inject(Store);
  private location = inject(Location);
  private snackBar = inject(MatSnackBar);
  private productsService = inject(ProductsService);
  private variationsService = inject(VariationsService);

  private readonly entries = toSignal(this.store.select(selectCartEntries), {
    initialValue: [],
  });

  private readonly colors = toSignal(this.store.select(selectAttributeColors), {
    initialValue: [] as ColorValue[],
  });

  private readonly simpleAttributes = toSignal(
    this.store.select(selectAttributeSimpleAttributes),
    { initialValue: {} as Record<string, SimpleAttributeOption[]> },
  );

  readonly cards = signal<CartCard[]>([]);
  readonly loading = signal(true);

  readonly totalCount = computed(() =>
    this.cards().reduce((sum, c) => sum + c.quantity, 0),
  );

  readonly totalPrice = computed(() =>
    this.cards().reduce((sum, c) => {
      const price = parseFloat(
        c.variation.sale_price && c.variation.sale_price !== '0'
          ? c.variation.sale_price
          : c.variation.regular_price,
      );

      return sum + (isNaN(price) ? 0 : price * c.quantity);
    }, 0),
  );

  ngOnInit(): void {
    const entries = this.entries();

    if (!entries.length) {
      this.loading.set(false);

      return;
    }

    const uniqueProductIds = [...new Set(entries.map(e => e.productId))];

    forkJoin(
      uniqueProductIds.map(productId =>
        forkJoin({
          product: this.productsService.getProduct(productId),
          variations: this.variationsService.getVariations(productId),
        }).pipe(
          map(({ product, variations }) => {
            return entries
              .filter(e => e.productId === productId)
              .map(e => {
                const variation = variations.find(v => v.id === e.variationId);

                return variation
                  ? { product, variation, quantity: e.quantity }
                  : null;
              })
              .filter((c): c is CartCard => c !== null);
          }),
          catchError(() => of([] as CartCard[])),
        ),
      ),
    )
      .pipe(map(groups => groups.flat()))
      .subscribe({
        next: cards => {
          this.cards.set(cards);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  getPrice(variation: ProductVariation): number {
    const p = parseFloat(
      variation.sale_price && variation.sale_price !== '0'
        ? variation.sale_price
        : variation.regular_price,
    );

    return isNaN(p) ? 0 : p;
  }

  getAttrLabel(variation: ProductVariation): string {
    return variation.attributes
      .map(a => this.resolveOptionName(a.name, a.option))
      .filter(Boolean)
      .join(', ');
  }

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

  isAtLimit(card: CartCard): boolean {
    return card.quantity >= card.variation.stock_quantity;
  }

  increment(variationId: number): void {
    const card = this.cards().find(c => c.variation.id === variationId);

    if (!card || this.isAtLimit(card)) return;

    const qty = card.quantity + 1;

    this.store.dispatch(
      CartActions.updateQuantity({ variationId, quantity: qty }),
    );
    this.cards.update(list =>
      list.map(c =>
        c.variation.id === variationId ? { ...c, quantity: qty } : c,
      ),
    );
  }

  decrement(variationId: number): void {
    const card = this.cards().find(c => c.variation.id === variationId);

    if (!card) return;

    const qty = card.quantity - 1;

    if (qty <= 0) {
      this.remove(variationId);

      return;
    }

    this.store.dispatch(
      CartActions.updateQuantity({ variationId, quantity: qty }),
    );
    this.cards.update(list =>
      list.map(c =>
        c.variation.id === variationId ? { ...c, quantity: qty } : c,
      ),
    );
  }

  setQuantity(variationId: number, event: Event): void {
    const card = this.cards().find(c => c.variation.id === variationId);

    if (!card) return;

    const input = event.target as HTMLInputElement | null;
    const rawValue = input?.value ?? '';
    let qty = parseInt(rawValue, 10);

    if (!isNaN(qty) && qty > card.variation.stock_quantity) {
      if (input) {
        input.value = String(card.quantity);
      }

      this.snackBar.open(
        `Кількість ${qty} недоступна. У наявності: ${card.variation.stock_quantity}`,
        'OK',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        },
      );

      return;
    }

    if (isNaN(qty) || qty < 1) qty = card.quantity;

    if (input) {
      input.value = String(qty);
    }

    this.store.dispatch(
      CartActions.updateQuantity({ variationId, quantity: qty }),
    );
    this.cards.update(list =>
      list.map(c =>
        c.variation.id === variationId ? { ...c, quantity: qty } : c,
      ),
    );
  }

  remove(variationId: number): void {
    this.store.dispatch(CartActions.remove({ variationId }));
    this.cards.update(list => list.filter(c => c.variation.id !== variationId));
  }

  goBack(): void {
    this.location.back();
  }
}
