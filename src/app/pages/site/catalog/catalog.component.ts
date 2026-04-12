import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { Product, ProductVariation } from '@app/models/product.models';
import { ColorValue } from '@app/models/config.models';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';
import {
  ProductCardComponent,
  ProductCardEvent,
} from '@app/components/product-card/product-card.component';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';
import { selectAttributeColors } from '@store/attributes/attributes.selectors';

export interface ProductCardItem {
  product: Product;
  variation: ProductVariation;
}

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'за популярністю' },
  { value: 'price-asc', label: 'спочатку дешевше' },
  { value: 'price-desc', label: 'спочатку дорожче' },
  { value: 'name', label: 'за назвою' },
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, BreadcrumbComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  private productsService = inject(ProductsService);
  private variationsService = inject(VariationsService);
  private store = inject(Store);

  items: ProductCardItem[] = [];
  loading = false;
  readonly favorites = signal<Set<number>>(new Set());

  readonly sortOptions = SORT_OPTIONS;
  readonly activeSort = signal<SortOption>('popular');
  readonly filtersOpen = signal(false);
  readonly colorsDropOpen = signal(false);
  readonly selectedColors = signal<Set<string>>(new Set());

  readonly colorsList = toSignal(this.store.select(selectAttributeColors), {
    initialValue: [] as ColorValue[],
  });

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const toolbar = document.querySelector('.catalog__toolbar');

    if (toolbar && !toolbar.contains(target as Node)) {
      this.filtersOpen.set(false);
      this.colorsDropOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.loading = true;

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
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: items => (this.items = items),
        error: () => (this.items = []),
      });
  }

  setSort(sort: SortOption): void {
    this.activeSort.set(sort);
  }

  toggleFilters(): void {
    this.filtersOpen.update(v => !v);

    if (!this.filtersOpen()) {
      this.colorsDropOpen.set(false);
    }
  }

  toggleColorsDrop(event: Event): void {
    event.stopPropagation();
    this.colorsDropOpen.update(v => !v);
  }

  toggleColor(slug: string): void {
    this.selectedColors.update(set => {
      const next = new Set(set);

      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }

      return next;
    });
  }

  swatchBg(hex: string[]): string {
    if (!hex?.length) return '#ccc';

    if (hex.length === 1) return hex[0];

    const step = 100 / hex.length;
    const stops = hex
      .flatMap((h, i) => [`${h} ${i * step}%`, `${h} ${(i + 1) * step}%`])
      .join(', ');

    return `linear-gradient(135deg, ${stops})`;
  }

  onAddToCart(event: ProductCardEvent): void {
    // TODO: dispatch add-to-cart action
    void event;
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
