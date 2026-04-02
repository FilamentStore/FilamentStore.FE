import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `
    <div class="page-placeholder">
      <app-breadcrumb [items]="[{ label: 'Кошик' }]" />
      <h1>Кошик</h1>
    </div>
  `,
  styles: [
    `
      .page-placeholder {
        padding: 0 16px 48px;
      }
    `,
  ],
})
export class CartComponent {}
