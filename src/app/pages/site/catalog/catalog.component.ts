import { Component } from '@angular/core';

@Component({
  selector: 'app-catalog',
  standalone: true,
  template: `<div class="page-placeholder"><h1>Каталог</h1></div>`,
  styles: [
    `
      .page-placeholder {
        padding: 48px 16px;
        text-align: center;
      }
    `,
  ],
})
export class CatalogComponent {}
