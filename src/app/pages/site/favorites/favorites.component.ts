import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `
    <div class="page-placeholder">
      <app-breadcrumb [items]="[{ label: 'Обране' }]" />
      <h1>Обране</h1>
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
export class FavoritesComponent {}
