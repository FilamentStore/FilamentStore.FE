import { Component } from '@angular/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  template: `<div class="page-placeholder"><h1>Кошик</h1></div>`,
  styles: [
    `
      .page-placeholder {
        padding: 48px 16px;
        text-align: center;
      }
    `,
  ],
})
export class CartComponent {}
