import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WcCategory } from '@app/models/config.models';

@Component({
  selector: 'app-categories-carousel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories-carousel.component.html',
  styleUrl: './categories-carousel.component.scss',
})
export class CategoriesCarouselComponent {
  @Input() categories: WcCategory[] = [];
  @Input() loading = false;

  activeCategory = 0;

  private catTouchX = 0;

  getCategoryOffset(index: number): number {
    const total = this.categories.length;

    if (!total) return 0;

    let offset = index - this.activeCategory;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    return offset;
  }

  onCategoryCardClick(index: number, event: Event): void {
    const offset = this.getCategoryOffset(index);

    if (offset === 0) return;

    event.preventDefault();

    if (offset > 0) this.nextCategory();
    else this.prevCategory();
  }

  prevCategory(): void {
    this.activeCategory =
      (this.activeCategory - 1 + this.categories.length) %
      this.categories.length;
  }

  nextCategory(): void {
    this.activeCategory = (this.activeCategory + 1) % this.categories.length;
  }

  onCatTouchStart(e: TouchEvent): void {
    this.catTouchX = e.touches[0].clientX;
  }

  onCatTouchEnd(e: TouchEvent): void {
    const delta = this.catTouchX - e.changedTouches[0].clientX;

    if (Math.abs(delta) < 40) return;

    if (delta > 0) this.nextCategory();
    else this.prevCategory();
  }

  getCardStyle(index: number): Record<string, string> {
    const total = this.categories.length;

    if (!total) return {};

    let offset = index - this.activeCategory;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isDesktop = w >= 1024;
    const cardW = isDesktop ? 440 : w >= 768 ? 300 : 240;
    const gap = isDesktop ? cardW + 16 : cardW + 24;
    const translateX = offset * gap;
    const rotateY = offset * 28;
    const scale = isDesktop
      ? Math.max(0.72, 1 - absOffset * 0.1)
      : Math.max(0.65, 1 - absOffset * 0.14);
    const blur = isDesktop
      ? Math.min(absOffset * 1.5, 5)
      : Math.min(absOffset * 2.5, 8);
    const opacity = isDesktop
      ? Math.max(0.42, 1 - absOffset * 0.2)
      : Math.max(0.28, 1 - absOffset * 0.3);
    const zIndex = Math.max(0, 10 - absOffset);

    return {
      width: `${cardW}px`,
      transform: `translateX(calc(-50% + ${translateX}px)) rotateY(${rotateY}deg) scale(${scale})`,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
      opacity: opacity.toFixed(2),
      zIndex: String(zIndex),
      cursor: 'pointer',
    };
  }
}
