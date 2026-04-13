import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';
import {
  ProductCardComponent,
  ProductCardEvent,
} from '@app/components/product-card/product-card.component';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';
import { SkeletonComponent } from '@app/components/skeleton/skeleton.component';
import { Product, ProductVariation } from '@app/models/product.models';
import { selectFavoriteItems } from '@store/favorites/favorites.selectors';
import { FavoritesActions } from '@store/favorites/favorites.actions';

interface FavoriteCard {
  product: Product;
  variation: ProductVariation;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterLink,
    ProductCardComponent,
    BreadcrumbComponent,
    SkeletonComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent implements OnInit {
  private store = inject(Store);
  private productsService = inject(ProductsService);
  private variationsService = inject(VariationsService);

  readonly favoriteItems = toSignal(this.store.select(selectFavoriteItems), {
    initialValue: [] as { productId: number; variationId: number }[],
  });

  readonly cards = signal<FavoriteCard[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    const pairs = this.favoriteItems();

    if (!pairs.length) {
      this.loading.set(false);

      return;
    }

    const uniqueProductIds = [...new Set(pairs.map(p => p.productId))];

    this.productsService
      .getProducts({
        status: 'publish',
        include: uniqueProductIds,
        perPage: uniqueProductIds.length,
      })
      .pipe(
        switchMap(response => {
          const products = response.products;

          if (!products.length) return of([]);

          return forkJoin(
            products.map(product =>
              this.variationsService.getVariations(product.id).pipe(
                map(variations => {
                  const wantedIds = pairs
                    .filter(p => p.productId === product.id)
                    .map(p => p.variationId);

                  return variations
                    .filter(
                      v => v.status === 'publish' && wantedIds.includes(v.id),
                    )
                    .map(variation => ({ product, variation }));
                }),
                catchError(() => of([])),
              ),
            ),
          ).pipe(map(groups => (groups as FavoriteCard[][]).flat()));
        }),
      )
      .subscribe({
        next: cards => {
          this.cards.set(cards);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onToggleFavorite(event: ProductCardEvent): void {
    this.store.dispatch(
      FavoritesActions.toggle({
        productId: event.product.id,
        variationId: event.variation.id,
      }),
    );
    this.cards.update(list =>
      list.filter(c => c.variation.id !== event.variation.id),
    );
  }

  onAddToCart(event: ProductCardEvent): void {
    void event;
  }
}
