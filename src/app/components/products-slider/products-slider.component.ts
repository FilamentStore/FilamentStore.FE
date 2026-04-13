import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Product, ProductVariation } from '@app/models/product.models';
import {
  ProductCardComponent,
  ProductCardEvent,
} from '@app/components/product-card/product-card.component';

export interface ProductSliderItem {
  product: Product;
  variation: ProductVariation;
}

@Component({
  selector: 'app-products-slider',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './products-slider.component.html',
  styleUrl: './products-slider.component.scss',
})
export class ProductsSliderComponent {
  @Input() title = '';
  @Input() items: ProductSliderItem[] = [];
  @Input() loading = false;

  @Output() addToCart = new EventEmitter<ProductCardEvent>();
  @Output() toggleFavorite = new EventEmitter<ProductCardEvent>();

  @ViewChild('track') trackEl?: ElementRef<HTMLElement>;

  scroll(dir: 1 | -1): void {
    const el = this.trackEl?.nativeElement;

    if (!el) return;

    const card = el.querySelector<HTMLElement>('.products-slider__card');
    const cardWidth = card ? card.offsetWidth + 20 : 300;

    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  }
}
