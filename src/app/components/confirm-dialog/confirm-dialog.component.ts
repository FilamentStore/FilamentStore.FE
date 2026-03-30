import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-dialog__header">
        <mat-icon class="confirm-dialog__icon">warning_amber</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="ref.close(false)">
          {{ data.cancelLabel ?? 'Скасувати' }}
        </button>
        <button mat-flat-button color="warn" (click)="ref.close(true)">
          {{ data.confirmLabel ?? 'Видалити' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .confirm-dialog {
        padding: 8px 4px 4px;
        min-width: 320px;
      }

      .confirm-dialog__header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 24px 8px;
      }

      .confirm-dialog__icon {
        color: #e65100;
        font-size: 24px;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        padding: 0;
      }

      mat-dialog-content p {
        margin: 0;
        color: #555;
        font-size: 14px;
      }

      mat-dialog-actions {
        gap: 8px;
        padding: 16px 24px 8px;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ConfirmDialogComponent>);
}
