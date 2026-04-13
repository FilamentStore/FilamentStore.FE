import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import {
  CatalogVariationItem,
  Product,
  ProductVariation,
} from '@app/models/product.models';
import { ColorValue } from '@app/models/config.models';
import { VariationsService } from '@app/services/tempService/variations.service';
import {
  ProductCardComponent,
  ProductCardEvent,
} from '@app/components/product-card/product-card.component';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';
import { selectAttributeColors } from '@store/attributes/attributes.selectors';
import { selectFavoriteVariationIds } from '@store/favorites/favorites.selectors';
import { FavoritesActions } from '@store/favorites/favorites.actions';

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

const SORT_MAP: Record<
  SortOption,
  'popularity' | 'name' | 'price_asc' | 'price_desc'
> = {
  popular: 'popularity',
  name: 'name',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
};

const PER_PAGE = 24;

function mapToCardItem(v: CatalogVariationItem): ProductCardItem {
  return {
    product: {
      id: v.product_id,
      name: v.product_name,
      brand: v.brand,
      category_id: v.category_id,
      short_description: '',
      description: '',
      images: v.product_images,
      status: v.product_status,
      slug: '',
      type: 'variable',
      attributes: [],
    },
    variation: {
      id: v.id,
      attributes: v.attributes.map(a => ({ name: a.name, option: a.option })),
      image: v.image ?? undefined,
      regular_price: v.regular_price,
      sale_price: v.sale_price,
      stock_quantity: v.stock_quantity,
      manage_stock: true,
      sku: v.sku,
      status: 'publish',
      weight: '',
    },
  };
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, BreadcrumbComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  private variationsService = inject(VariationsService);
  private store = inject(Store);

  items: ProductCardItem[] = [];
  readonly loading = signal(false);
  readonly favoriteVariationIds = toSignal(
    this.store.select(selectFavoriteVariationIds),
    { initialValue: [] as number[] },
  );

  readonly sortOptions = SORT_OPTIONS;
  readonly activeSort = signal<SortOption>('popular');
  readonly filtersOpen = signal(false);
  readonly colorsDropOpen = signal(false);
  readonly selectedColors = signal<Set<string>>(new Set());

  readonly colorsList = toSignal(this.store.select(selectAttributeColors), {
    initialValue: [] as ColorValue[],
  });

  // pagination
  readonly currentPage = signal(1);
  readonly totalItems = signal(0);
  readonly totalPages = signal(0);

  readonly pageNumbers = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const pages: (number | null)[] = [];

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== null) {
        pages.push(null);
      }
    }

    return pages;
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
    this.loadPage(1);
  }

  private loadPage(page: number): void {
    this.loading.set(true);

    this.variationsService
      .getCatalogVariations({
        page,
        per_page: PER_PAGE,
        sort: SORT_MAP[this.activeSort()],
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => {
          this.items = response.items.map(mapToCardItem);
          this.totalItems.set(response.total);
          this.totalPages.set(response.totalPages);
          this.currentPage.set(response.page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: () => (this.items = []),
      });
  }

  setSort(sort: SortOption): void {
    this.activeSort.set(sort);
    this.loadPage(1);
  }

  goToPage(page: number | null): void {
    if (page === null) return;
    const p = Math.max(1, Math.min(page, this.totalPages()));

    if (p === this.currentPage()) return;
    this.loadPage(p);
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
    this.store.dispatch(
      FavoritesActions.toggle({
        productId: event.product.id,
        variationId: event.variation.id,
      }),
    );
  }
}
