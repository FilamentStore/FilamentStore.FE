import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-placeholder">
      <h1>404</h1>
      <p>Сторінку не знайдено</p>
      <a routerLink="/">На головну</a>
    </div>
  `,
  styles: [
    `
      .page-placeholder {
        padding: 48px 16px;
        text-align: center;
      }
      a {
        color: var(--color-accent);
      }
    `,
  ],
})
export class NotFoundComponent {}
