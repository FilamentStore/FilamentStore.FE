import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `<div class="page-placeholder"><h1>Про нас</h1></div>`,
  styles: [
    `
      .page-placeholder {
        padding: 48px 16px;
        text-align: center;
      }
    `,
  ],
})
export class AboutComponent {}
