import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectFavoritesCount } from '@store/favorites/favorites.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { Subject } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProductsService } from '@app/services/tempService/products.service';
import { Product } from '@app/models/product.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NavbarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private store = inject(Store);

  readonly favoritesCount = toSignal(this.store.select(selectFavoritesCount), {
    initialValue: 0,
  });
  cartCount = 0;
  isMenuOpen = false;
  isSearchOpen = false;

  searchResults = signal<Product[]>([]);
  searchLoading = signal(false);
  searchQuery = signal('');

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();

  isHome = signal(this.isHomePath(this.router.url));
  isAtTop = signal(true);

  get isTransparent(): boolean {
    return this.isHome() && this.isAtTop();
  }

  private isHomePath(url: string): boolean {
    return url === '/' || url === '' || url.split('?')[0] === '/';
  }

  constructor() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(e => {
        this.isHome.set(
          this.isHomePath((e as NavigationEnd).urlAfterRedirects),
        );
        this.closeDropdown();
      });

    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.length < 2) {
            this.searchResults.set([]);
            this.searchLoading.set(false);

            return of(null);
          }

          this.searchLoading.set(true);

          return this.productsService
            .getProducts({ search: query, status: 'publish', page: 1 })
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(response => {
        this.searchLoading.set(false);
        if (response) this.searchResults.set(response.products.slice(0, 6));
      });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isAtTop.set(window.scrollY < 10);
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 350);
    } else {
      this.closeDropdown();
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();

    this.searchQuery.set(value);
    this.search$.next(value);
  }

  onSearchBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const relatedTarget = event.relatedTarget as HTMLElement | null;

    if (relatedTarget?.closest('.header-search__dropdown')) return;

    if (!input.value.trim() && !relatedTarget?.closest('.header-search')) {
      this.isSearchOpen = false;
    }

    this.closeDropdown();
  }

  goToProduct(id: number): void {
    void this.router.navigate(['/product', id]);
    this.closeDropdown();
    this.isSearchOpen = false;
    if (this.searchInput) this.searchInput.nativeElement.value = '';
  }

  private closeDropdown(): void {
    this.searchResults.set([]);
    this.searchQuery.set('');
    this.searchLoading.set(false);
  }
}
