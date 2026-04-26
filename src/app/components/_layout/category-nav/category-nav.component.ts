import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, map, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CategoriesService } from '@app/services/tempService/categories.service';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-nav.component.html',
  styleUrl: './category-nav.component.scss',
})
export class CategoryNavComponent {
  private router = inject(Router);
  private categoriesService = inject(CategoriesService);

  readonly categories = toSignal(
    this.categoriesService.getCategories().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  private readonly routeChange$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    startWith(null),
  );

  readonly isHome = toSignal(
    this.routeChange$.pipe(map(() => this.checkIsHome())),
    { initialValue: this.checkIsHome() },
  );

  readonly activeCategoryId = toSignal(
    this.routeChange$.pipe(map(() => this.parseActiveCategoryId())),
    { initialValue: this.parseActiveCategoryId() },
  );

  private checkIsHome(): boolean {
    return this.router.url.split('?')[0] === '/';
  }

  private parseActiveCategoryId(): string | null {
    const query = this.router.url.split('?')[1];

    return query ? new URLSearchParams(query).get('category_id') : null;
  }
}
