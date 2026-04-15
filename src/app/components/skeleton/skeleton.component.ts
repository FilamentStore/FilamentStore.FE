import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type SkeletonVariant =
  | 'product-grid'
  | 'product-slider'
  | 'categories'
  | 'product-detail'
  | 'search-results';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'product-grid';
  @Input() count = 1;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }
}
