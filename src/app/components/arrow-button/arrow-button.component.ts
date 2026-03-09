import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ArrowDirection = 'Up' | 'Down' | 'Left' | 'Right';

@Component({
  selector: 'app-arrow-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arrow-button.component.html',
  styleUrls: ['./arrow-button.component.scss'],
})
export class ArrowButtonComponent {
  direction = input<ArrowDirection>('Up');
  isDisabled = input<boolean>(false);
  click = output<void>();
}
