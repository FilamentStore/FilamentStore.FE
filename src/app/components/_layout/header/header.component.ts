import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
