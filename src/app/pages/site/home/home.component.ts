import {
  Component,
  ElementRef,
  signal,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, finalize } from 'rxjs';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';
import { CategoriesService } from '@app/services/tempService/categories.service';
import { Product, ProductVariation } from '@app/models/product.models';
import { WcCategory } from '@app/models/config.models';
import {
  ProductCardComponent,
  ProductCardEvent,
} from '@app/components/product-card/product-card.component';

export interface NewArrivalItem {
  product: Product;
  variation: ProductVariation;
}

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
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private productsService = inject(ProductsService);
  private variationsService = inject(VariationsService);
  private categoriesService = inject(CategoriesService);

  @ViewChild('newArrivalsTrack') trackEl?: ElementRef<HTMLElement>;
  @ViewChild('saleTrack') saleTrackEl?: ElementRef<HTMLElement>;
  @ViewChild('categoriesTrack') categoriesTrackEl?: ElementRef<HTMLElement>;
  readonly slides: HeroSlide[] = [
    {
      material: 'PLA',
      title: 'Преміум пластик\nдля 3D друку',
      description:
        'Біорозкладний, простий у друку,\nдоступний у широкій палітрі кольорів',
      cta: 'Переглянути асортимент',
      ctaLink: '/catalog',
      image: 'assets/images/baners/1.png',
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
      title: 'Деревний\nфіламент',
      description:
        'Натуральний вигляд і текстура,\nідеальний для декоративних елементів',
      cta: 'Обрати WOOD',
      ctaLink: '/catalog',
      image: 'assets/images/baners/3.png',
    },
  ];

  activeIndex = signal(0);
  newArrivals = signal<NewArrivalItem[]>([]);
  newArrivalsLoading = signal(true);
  categories = signal<WcCategory[]>([]);
  categoriesLoading = signal(true);

  private timer?: ReturnType<typeof setInterval>;
  private touchStartX = 0;

  ngOnInit(): void {
    this.startTimer();
    this.loadNewArrivals();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private loadNewArrivals(): void {
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
          ).pipe(map((groups: NewArrivalItem[][]) => groups.flat()));
        }),
        finalize(() => this.newArrivalsLoading.set(false)),
      )
      .subscribe({ next: items => this.newArrivals.set(items) });
  }

  scrollArrivals(dir: 1 | -1): void {
    this.scrollTrack(this.trackEl, dir);
  }

  scrollSale(dir: 1 | -1): void {
    this.scrollTrack(this.saleTrackEl, dir);
  }

  scrollCategories(dir: 1 | -1): void {
    const el = this.categoriesTrackEl?.nativeElement;

    if (!el) return;
    const card = el.querySelector<HTMLElement>('.categories__card');
    const cardWidth = card ? card.offsetWidth + 16 : 200;

    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  }

  private loadCategories(): void {
    this.categoriesService
      .getCategories()
      .pipe(finalize(() => this.categoriesLoading.set(false)))
      .subscribe({ next: cats => this.categories.set(cats) });
  }

  private scrollTrack(
    ref: ElementRef<HTMLElement> | undefined,
    dir: 1 | -1,
  ): void {
    const el = ref?.nativeElement;

    if (!el) return;
    const card = el.querySelector<HTMLElement>('.new-arrivals__card');
    const cardWidth = card ? card.offsetWidth + 20 : 300;

    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  }

  onAddToCart(event: ProductCardEvent): void {
    void event;
  }

  onToggleFavorite(event: ProductCardEvent): void {
    void event;
  }

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
}
