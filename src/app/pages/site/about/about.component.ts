import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';
import { SeoService } from '@app/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [BreadcrumbComponent, RouterLink],
  templateUrl: 'about.component.html',
  styleUrl: 'about.component.scss',
})
export class AboutComponent implements OnInit {
  private seo = inject(SeoService);

  readonly photos = Array.from(
    { length: 10 },
    (_, i) => `assets/images/about-us/${i}.png`,
  );

  ngOnInit(): void {
    this.seo.set({
      title: 'Про нас',
      description:
        'Filament Store — українська компанія з продажу філаменту для 3D друку. Дізнайтесь більше про нашу команду та цінності.',
      canonical: 'https://filamentstore.com.ua/about',
    });
  }
}
