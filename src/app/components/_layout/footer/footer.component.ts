import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowButtonComponent } from '../../arrow-button/arrow-button.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, ArrowButtonComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
