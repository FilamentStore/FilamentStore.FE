import { Component } from '@angular/core';
import { ArrowButtonComponent } from '../../arrow-button/arrow-button.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ArrowButtonComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
