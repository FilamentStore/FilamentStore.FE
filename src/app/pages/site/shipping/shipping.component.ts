import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: 'shipping.component.html',
  styleUrl: 'shipping.component.scss',
})
export class ShippingComponent {}
