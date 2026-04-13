import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { Product, ProductVariation } from '@app/models/product.models';
import { ColorValue, SimpleAttributeOption } from '@app/models/config.models';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '@app/components/breadcrumb/breadcrumb.component';
import { SkeletonComponent } from '@app/components/skeleton/skeleton.component';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';
import {
  selectAttributeColors,
  selectAttributeSimpleAttributes,
} from '@store/attributes/attributes.selectors';
import { selectFavoriteVariationIds } from '@store/favorites/favorites.selectors';
import { FavoritesActions } from '@store/favorites/favorites.actions';
import { ROUTES } from '@app/constants/app.routes.const';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, SkeletonComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private productsService = inject(ProductsService);
  private variationsService = inject(VariationsService);
  private store = inject(Store);

  readonly product = signal<Product | null>(null);
  readonly variations = signal<ProductVariation[]>([]);
  readonly activeVariation = signal<ProductVariation | null>(null);
  readonly loading = signal(true);
  private readonly favoriteVariationIds = toSignal(
    this.store.select(selectFavoriteVariationIds),
    { initialValue: [] as number[] },
  );

  readonly isFavorite = computed(() =>
    this.favoriteVariationIds().includes(this.activeVariation()?.id ?? -1),
  );

  private colors = toSignal(this.store.select(selectAttributeColors), {
    initialValue: [] as ColorValue[],
  });
  private simpleAttributes = toSignal(
    this.store.select(selectAttributeSimpleAttributes),
    { initialValue: {} as Record<string, SimpleAttributeOption[]> },
  );

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const p = this.product();

    return p
      ? [
          { label: 'Каталог', route: '/' + ROUTES.site.catalog },
          { label: p.name },
        ]
      : [{ label: 'Каталог', route: '/' + ROUTES.site.catalog }];
  });

  readonly selectedAttrs = computed(() => {
    const v = this.activeVariation();

    if (!v) return new Map<string, string>();

    return new Map(
      v.attributes.map(a => [a.name, a.option] as [string, string]),
    );
  });

  readonly currentPrice = computed(() => {
    const v = this.activeVariation();

    if (!v) return '';
    const { sale_price, regular_price } = v;

    return sale_price && sale_price !== '0' && sale_price !== regular_price
      ? sale_price
      : regular_price;
  });

  readonly oldPrice = computed(() => {
    const v = this.activeVariation();

    if (!v) return null;
    const { sale_price, regular_price } = v;

    return sale_price && sale_price !== '0' && sale_price !== regular_price
      ? regular_price
      : null;
  });

  readonly stockStatus = computed(() => {
    const qty = this.activeVariation()?.stock_quantity ?? 0;

    if (qty === 0) return 'out';
    if (qty <= 5) return 'low';

    return 'in';
  });

  readonly activeImage = computed(() => {
    const v = this.activeVariation();
    const p = this.product();

    return v?.image ?? p?.images?.[0] ?? null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('productId'));

    forkJoin({
      product: this.productsService.getProduct(id),
      variations: this.variationsService.getVariations(id),
    }).subscribe({
      next: ({ product, variations }) => {
        const published = variations.filter(v => v.status === 'publish');

        this.product.set(product);
        this.variations.set(published);
        this.activeVariation.set(published[0] ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectOption(attrName: string, option: string): void {
    const current = new Map(this.selectedAttrs());

    current.set(attrName, option);

    let match = this.variations().find(v =>
      [...current.entries()].every(([name, opt]) =>
        v.attributes.some(a => a.name === name && a.option === opt),
      ),
    );

    if (!match) {
      match = this.variations().find(v =>
        v.attributes.some(a => a.name === attrName && a.option === option),
      );
    }

    if (match) this.activeVariation.set(match);
  }

  isColorAttr(attrName: string): boolean {
    return ATTRIBUTE_CONFIGS.find(c => c.label === attrName)?.type === 'color';
  }

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

  getColorHex(slug: string): string[] {
    return this.colors().find(c => c.slug === slug)?.hex ?? ['#ccc'];
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

  toggleFavorite(): void {
    const product = this.product();
    const variation = this.activeVariation();

    if (product && variation) {
      this.store.dispatch(
        FavoritesActions.toggle({
          productId: product.id,
          variationId: variation.id,
        }),
      );
    }
  }

  goBack(): void {
    this.location.back();
  }
}
