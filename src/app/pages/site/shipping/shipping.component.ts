import { Component, OnInit, inject } from '@angular/core';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';
import { SeoService } from '@app/services/seo.service';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: 'shipping.component.html',
  styleUrl: 'shipping.component.scss',
})
export class ShippingComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({
      title: 'Доставка та оплата',
      description:
        'Умови доставки філаменту по всій Україні. Відправляємо в день замовлення. Нова Пошта, Укрпошта. Безкоштовна доставка від певної суми.',
      canonical: 'https://filamentstore.com.ua/shipping',
    });
  }
}
