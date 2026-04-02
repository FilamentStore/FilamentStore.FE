import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NavbarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  favoritesCount = 0;
  cartCount = 0;
  isMenuOpen = false;
  isSearchOpen = false;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private readonly router = inject(Router);

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
    }
  }

  onSearchBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const relatedTarget = event.relatedTarget as HTMLElement | null;

    if (!input.value.trim() && !relatedTarget?.closest('.header-search')) {
      this.isSearchOpen = false;
    }
  }
}
