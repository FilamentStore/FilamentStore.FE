import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { ProductFormComponent } from '@pages/crm/products/product-form/product-form.component';

export const unsavedChangesGuard: CanDeactivateFn<
  ProductFormComponent
> = component => {
  const hasDirty = component.variationsTab?.hasDirtyVariations();

  if (!hasDirty) return true;

  const dialog = inject(MatDialog);

  return dialog
    .open(ConfirmDialogComponent, {
      data: {
        title: 'Незбережені зміни',
        message: 'Є варіації зі змінами, які не збережено. Покинути сторінку?',
        confirmLabel: 'Покинути',
        cancelLabel: 'Залишитись',
      },
      width: '400px',
    })
    .afterClosed()
    .pipe(map(result => !!result));
};
