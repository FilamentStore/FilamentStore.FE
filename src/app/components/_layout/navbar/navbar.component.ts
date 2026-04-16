import {
  Component,
  input,
  output,
  inject,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectFavoritesCount } from '@store/favorites/favorites.selectors';
import { selectCartItemsCount } from '@store/cart/cart.selectors';
import { IconBadgeComponent } from '@app/components/icon-badge/icon-badge.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconBadgeComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnChanges, OnDestroy {
  isOpen = input<boolean>(false);
  closeMenu = output<void>();

  private store = inject(Store);

  readonly favoritesCount = toSignal(this.store.select(selectFavoritesCount), {
    initialValue: 0,
  });
  readonly cartCount = toSignal(this.store.select(selectCartItemsCount), {
    initialValue: 0,
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen()) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  onClose(): void {
    this.closeMenu.emit();
  }
}
