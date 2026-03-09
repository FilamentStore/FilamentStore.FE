import {
  Component,
  input,
  output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnChanges, OnDestroy {
  isOpen = input<boolean>(false);
  closeMenu = output<void>();

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
