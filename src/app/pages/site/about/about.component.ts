import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `
    <div class="page-placeholder">
      <app-breadcrumb [items]="[{ label: 'Про нас' }]" />
      <h1>Про нас</h1>
    </div>
  `,
  styles: [
    `
      .page-placeholder {
        padding-inline: 16px;
      }
    `,
  ],
})
export class AboutComponent {}
