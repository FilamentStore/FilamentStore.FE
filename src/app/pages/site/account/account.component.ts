import { Component } from '@angular/core';

@Component({
  selector: 'app-account',
  standalone: true,
  template: `<div class="page-placeholder"><h1>Акаунт</h1></div>`,
  styles: [
    `
      .page-placeholder {
        padding: 48px 16px;
        text-align: center;
      }
    `,
  ],
})
export class AccountComponent {}
