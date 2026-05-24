import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { SeoService } from '@app/services/seo.service';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { VariationsService } from '@app/services/tempService/variations.service';
import { CategoriesService } from '@app/services/tempService/categories.service';
import { CatalogVariationItem } from '@app/models/product.models';
import { WcCategory } from '@app/models/config.models';
import { ProductCardEvent } from '@app/components/product-card/product-card.component';
import {
  ProductsSliderComponent,
  ProductSliderItem,
} from '@app/components/products-slider/products-slider.component';
import { CategoriesCarouselComponent } from './components/categories-carousel/categories-carousel.component';
import { FavoritesActions } from '@store/favorites/favorites.actions';
import { CartActions } from '@store/cart/cart.actions';

interface HeroSlide {
  material: string;
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductsSliderComponent, CategoriesCarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private variationsService = inject(VariationsService);
  private categoriesService = inject(CategoriesService);
  private seo = inject(SeoService);
  readonly slides: HeroSlide[] = [
    {
      material: 'PLA',
      title: 'Преміум філамент\nдля 3D друку',
      description:
        'Стабільний діаметр ±0.02 мм для ідеального друку.\nРівна, щільна намотка без перехлестів і вузлів.',
      cta: 'Переглянути асортимент',
      ctaLink: '/catalog',
      image: 'assets/images/baners/bn-1.png',
    },
    {
      material: 'PETG',
      title: 'Міцний і прозорий\nфіламент',
      description:
        'Стійкий до температур та хімії,\nідеальний для функціональних деталей',
      cta: 'Обрати PETG',
      ctaLink: '/catalog',
      image: 'assets/images/baners/2.png',
    },
    {
      material: 'WOOD',
      title: 'Швидка доставка\nпо всій Україні',
      description:
        'Відправляємо в день замовлення.\nДізнайтесь більше про нас і умови доставки',
      cta: 'Умови доставки',
      ctaLink: '/shipping',
      image: 'assets/images/baners/3.png',
    },
  ];

  activeIndex = signal(0);
  newArrivals: ProductSliderItem[] = [];
  newArrivalsLoading = true;
  saleItems: ProductSliderItem[] = [];
  saleLoading = true;
  categories: WcCategory[] = [];
  categoriesLoading = true;

  private timer?: ReturnType<typeof setInterval>;
  private touchStartX = 0;

  ngOnInit(): void {
    this.seo.set({
      title: 'Преміум філамент для 3D друку',
      description:
        'Купити філамент для 3D друку в Україні. PLA, PETG, ABS та інші матеріали. Стабільний діаметр, швидка доставка по всій Україні.',
      canonical: 'https://filamentstore.com.ua',
    });
    this.startTimer();
    this.loadNewest();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  private toSliderItems(items: CatalogVariationItem[]): ProductSliderItem[] {
    return items.map(item => ({
      product: {
        id: item.product_id,
        name: item.product_name,
        brand: item.brand,
        category_id: item.category_id,
        short_description: '',
        description: '',
        images: item.product_images,
        status: 'publish' as const,
        slug: '',
        type: 'variable' as const,
        attributes: [],
      },
      variation: {
        id: item.id,
        attributes: item.attributes.map(a => ({
          name: a.name,
          option: a.option,
        })),
        image: item.image ?? undefined,
        regular_price: item.regular_price,
        sale_price: item.sale_price,
        stock_quantity: item.stock_quantity,
        manage_stock: true as const,
        sku: item.sku,
        status: 'publish' as const,
        weight: '',
        box_qty: item.box_qty,
        custom_name: item.custom_name,
      },
    }));
  }

  private loadNewest(): void {
    this.variationsService
      .getNewest(12)
      .pipe(
        finalize(() => {
          this.newArrivalsLoading = false;
          this.saleLoading = false;
        }),
      )
      .subscribe({
        next: res => {
          const items = this.toSliderItems(res.items);

          this.newArrivals = items;
          this.saleItems = items;
        },
      });
  }

  private loadCategories(): void {
    this.categoriesService
      .getCategories()
      .pipe(finalize(() => (this.categoriesLoading = false)))
      .subscribe({ next: cats => (this.categories = cats) });
  }

  // ── Hero slider ───────────────────────────────────────────────────────────

  goTo(index: number): void {
    this.activeIndex.set(index);
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const delta = this.touchStartX - event.changedTouches[0].clientX;

    if (Math.abs(delta) < 40) return;

    if (delta > 0) {
      this.activeIndex.update(i => (i + 1) % this.slides.length);
    } else {
      this.activeIndex.update(
        i => (i - 1 + this.slides.length) % this.slides.length,
      );
    }

    this.restartTimer();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.activeIndex.update(i => (i + 1) % this.slides.length);
    }, 7000);
  }

  private restartTimer(): void {
    clearInterval(this.timer);
    this.startTimer();
  }

  // ── Event passthrough ─────────────────────────────────────────────────────

  onAddToCart(event: ProductCardEvent): void {
    this.store.dispatch(
      CartActions.add({
        productId: event.product.id,
        variationId: event.variation.id,
      }),
    );
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
