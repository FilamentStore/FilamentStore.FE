import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { Product, ProductVariation } from '@app/models/product.models';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';
import {
  ProductCardComponent,
  ProductCardEvent,
} from '@app/components/product-card/product-card.component';

export interface ProductCardItem {
  product: Product;
  variation: ProductVariation;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private productsService = inject(ProductsService);
  private variationsService = inject(VariationsService);

  readonly items = signal<ProductCardItem[]>([]);
  readonly loading = signal(false);
  readonly favorites = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loading.set(true);

    this.productsService
      .getProducts({ status: 'publish', page: 1 })
      .pipe(
        switchMap(response => {
          const products = response.products;

          if (!products.length) return of([]);

          return forkJoin(
            products.map(product =>
              this.variationsService.getVariations(product.id).pipe(
                map(variations =>
                  variations
                    .filter(v => v.status === 'publish')
                    .map(variation => ({ product, variation })),
                ),
                catchError(() => of([])),
              ),
            ),
          ).pipe(map(groups => (groups as ProductCardItem[][]).flat()));
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: items => this.items.set(items),
        error: () => this.items.set([]),
      });
  }

  onAddToCart(event: ProductCardEvent): void {
    // TODO: dispatch add-to-cart action
    console.log('Add to cart:', event.product.name, event.variation.attributes);
  }

  onToggleFavorite(event: ProductCardEvent): void {
    this.favorites.update(favs => {
      const next = new Set(favs);

      if (next.has(event.variation.id)) {
        next.delete(event.variation.id);
      } else {
        next.add(event.variation.id);
      }

      return next;
    });
  }
}
