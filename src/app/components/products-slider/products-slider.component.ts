import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product, ProductVariation } from '@app/models/product.models';
import {
  ProductCardComponent,
  ProductCardEvent,
} from '@app/components/product-card/product-card.component';
import { SkeletonComponent } from '@app/components/skeleton/skeleton.component';
import { selectFavoriteVariationIds } from '@store/favorites/favorites.selectors';
import { selectCartVariationIds } from '@store/cart/cart.selectors';
import { FavoritesActions } from '@store/favorites/favorites.actions';

export interface ProductSliderItem {
  product: Product;
  variation: ProductVariation;
}

@Component({
  selector: 'app-products-slider',
  standalone: true,
  imports: [ProductCardComponent, SkeletonComponent],
  templateUrl: './products-slider.component.html',
  styleUrl: './products-slider.component.scss',
})
export class ProductsSliderComponent {
  private store = inject(Store);

  @Input() title = '';
  @Input() items: ProductSliderItem[] = [];
  @Input() loading = false;

  @Output() addToCart = new EventEmitter<ProductCardEvent>();
  @Output() toggleFavorite = new EventEmitter<ProductCardEvent>();

  @ViewChild('track') trackEl?: ElementRef<HTMLElement>;

  readonly favoriteVariationIds = toSignal(
    this.store.select(selectFavoriteVariationIds),
    { initialValue: [] as number[] },
  );
  readonly cartVariationIds = toSignal(
    this.store.select(selectCartVariationIds),
    { initialValue: [] as number[] },
  );

  scroll(dir: 1 | -1): void {
    const el = this.trackEl?.nativeElement;

    if (!el) return;

    const card = el.querySelector<HTMLElement>('.products-slider__card');
    const cardWidth = card ? card.offsetWidth + 20 : 300;

    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  }

  onToggleFavorite(event: ProductCardEvent): void {
    this.store.dispatch(
      FavoritesActions.toggle({
        productId: event.product.id,
        variationId: event.variation.id,
      }),
    );
    this.toggleFavorite.emit(event);
  }
}
