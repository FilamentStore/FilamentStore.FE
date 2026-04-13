import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-badge',
  standalone: true,
  template: `
    @if (count() > 0) {
      <span class="badge">{{ count() > 99 ? '99+' : count() }}</span>
    }
  `,
  styleUrl: './icon-badge.component.scss',
})
export class IconBadgeComponent {
  count = input.required<number>();
}
