import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WcCategory } from '@app/models/config.models';
import { SkeletonComponent } from '@app/components/skeleton/skeleton.component';

@Component({
  selector: 'app-categories-carousel',
  standalone: true,
  imports: [RouterLink, SkeletonComponent],
  templateUrl: './categories-carousel.component.html',
  styleUrl: './categories-carousel.component.scss',
})
export class CategoriesCarouselComponent {
  @Input() categories: WcCategory[] = [];
  @Input() loading = false;
}
