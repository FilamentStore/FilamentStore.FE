import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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

const VALID_SORTS = new Set<SortOption>([
  'popular',
  'price-asc',
  'price-desc',
  'name',
]);

const PER_PAGE = 24;

export const FILTER_BRANDS = ['BambuLab', 'Sunlu', 'Kingroon'];
export const FILTER_MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU'];
export const FILTER_DIAMETERS = [
  { label: '1.75 мм', value: '1.75' },
  { label: '3.00 мм', value: '3.00' },
];
export const FILTER_WEIGHTS = [
  { label: '0.5 кг', value: '0.5' },
  { label: '1 кг', value: '1' },
  { label: '2 кг', value: '2' },
];

function splitParam(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // ── Data ──────────────────────────────────────────────────────────────────

  items: ProductCardItem[] = [];
  readonly loading = signal(false);
  readonly favoriteVariationIds = toSignal(
    this.store.select(selectFavoriteVariationIds),
    { initialValue: [] as number[] },
  );

  // ── Sort ──────────────────────────────────────────────────────────────────

  readonly sortOptions = SORT_OPTIONS;
  readonly activeSort = signal<SortOption>('popular');

  // ── Pagination ────────────────────────────────────────────────────────────

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

  // ── Filters (pending state — committed to URL on applyFilters) ────────────

  readonly selectedBrands = signal<Set<string>>(new Set());
  readonly selectedColors = signal<Set<string>>(new Set());
  readonly selectedMaterials = signal<Set<string>>(new Set());
  readonly selectedDiameters = signal<Set<string>>(new Set());
  readonly selectedWeights = signal<Set<string>>(new Set());

  readonly activeFiltersCount = computed(
    () =>
      this.selectedBrands().size +
      this.selectedColors().size +
      this.selectedMaterials().size +
      this.selectedDiameters().size +
      this.selectedWeights().size,
  );

  // ── Filter options ────────────────────────────────────────────────────────

  readonly brands = FILTER_BRANDS;
  readonly materials = FILTER_MATERIALS;
  readonly diameters = FILTER_DIAMETERS;
  readonly weights = FILTER_WEIGHTS;

  readonly colorsList = toSignal(this.store.select(selectAttributeColors), {
    initialValue: [] as ColorValue[],
  });

  // ── UI state ──────────────────────────────────────────────────────────────

  readonly filtersOpen = signal(false);
  readonly colorsDropOpen = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const toolbar = document.querySelector('.catalog__toolbar');

    if (toolbar && !toolbar.contains(target as Node)) {
      this.filtersOpen.set(false);
      this.colorsDropOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.syncFromParams(params);
        this.fetch();
      });
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private syncFromParams(params: ParamMap): void {
    const sortRaw = params.get('sort') as SortOption | null;

    this.activeSort.set(
      sortRaw && VALID_SORTS.has(sortRaw) ? sortRaw : 'popular',
    );
    this.currentPage.set(Math.max(1, Number(params.get('page') ?? 1)));
    this.selectedBrands.set(new Set(splitParam(params.get('brand'))));
    this.selectedColors.set(new Set(splitParam(params.get('attribute_color'))));
    this.selectedMaterials.set(
      new Set(splitParam(params.get('attribute_material'))),
    );
    this.selectedDiameters.set(
      new Set(splitParam(params.get('attribute_diameter'))),
    );
    this.selectedWeights.set(
      new Set(splitParam(params.get('attribute_weight'))),
    );
  }

  private fetch(): void {
    this.loading.set(true);

    const brand = [...this.selectedBrands()].join(',') || undefined;
    const attrColor = [...this.selectedColors()].join(',') || undefined;
    const attrMaterial = [...this.selectedMaterials()].join(',') || undefined;
    const attrDiameter = [...this.selectedDiameters()].join(',') || undefined;
    const attrWeight = [...this.selectedWeights()].join(',') || undefined;

    this.variationsService
      .getCatalogVariations({
        page: this.currentPage(),
        per_page: PER_PAGE,
        sort: SORT_MAP[this.activeSort()],
        ...(brand && { brand }),
        ...(attrColor && { attribute_color: attrColor }),
        ...(attrMaterial && { attribute_material: attrMaterial }),
        ...(attrDiameter && { attribute_diameter: attrDiameter }),
        ...(attrWeight && { attribute_weight: attrWeight }),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => {
          this.items = response.items.map(mapToCardItem);
          this.totalItems.set(response.total);
          this.totalPages.set(response.totalPages);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: () => (this.items = []),
      });
  }

  private navigate(queryParams: Record<string, string | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  // ── Sort ──────────────────────────────────────────────────────────────────

  setSort(sort: SortOption): void {
    this.navigate({ sort, page: '1' });
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  goToPage(page: number | null): void {
    if (page === null) return;

    const p = Math.max(1, Math.min(page, this.totalPages()));

    if (p === this.currentPage()) return;
    this.navigate({ page: String(p) });
  }

  // ── Filter toggles ────────────────────────────────────────────────────────

  toggleBrand(brand: string): void {
    this.selectedBrands.update(set => {
      const next = new Set(set);

      next.has(brand) ? next.delete(brand) : next.add(brand);

      return next;
    });
  }

  toggleMaterial(mat: string): void {
    this.selectedMaterials.update(set => {
      const next = new Set(set);

      next.has(mat) ? next.delete(mat) : next.add(mat);

      return next;
    });
  }

  toggleDiameter(val: string): void {
    this.selectedDiameters.update(set => {
      const next = new Set(set);

      next.has(val) ? next.delete(val) : next.add(val);

      return next;
    });
  }

  toggleWeight(val: string): void {
    this.selectedWeights.update(set => {
      const next = new Set(set);

      next.has(val) ? next.delete(val) : next.add(val);

      return next;
    });
  }

  toggleColor(slug: string): void {
    this.selectedColors.update(set => {
      const next = new Set(set);

      next.has(slug) ? next.delete(slug) : next.add(slug);

      return next;
    });
  }

  // ── Filter apply / reset ──────────────────────────────────────────────────

  applyFilters(): void {
    this.filtersOpen.set(false);
    this.colorsDropOpen.set(false);
    this.navigate({
      page: '1',
      brand: [...this.selectedBrands()].join(',') || null,
      attribute_color: [...this.selectedColors()].join(',') || null,
      attribute_material: [...this.selectedMaterials()].join(',') || null,
      attribute_diameter: [...this.selectedDiameters()].join(',') || null,
      attribute_weight: [...this.selectedWeights()].join(',') || null,
    });
  }

  resetFilters(): void {
    this.filtersOpen.set(false);
    this.colorsDropOpen.set(false);
    this.navigate({
      page: '1',
      brand: null,
      attribute_color: null,
      attribute_material: null,
      attribute_diameter: null,
      attribute_weight: null,
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

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
