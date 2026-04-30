import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [BreadcrumbComponent, RouterLink],
  templateUrl: 'about.component.html',
  styleUrl: 'about.component.scss',
})
export class AboutComponent {
  readonly photos = Array.from(
    { length: 10 },
    (_, i) => `assets/images/about-us/${i}.png`,
  );
}
