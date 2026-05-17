import { Routes } from '@angular/router';
import { ProductsListComponent } from '@pages/crm/products/products-list/products-list.component';
import { ProductFormComponent } from '@pages/crm/products/product-form/product-form.component';
import { unsavedChangesGuard } from '@app/helper/guards/unsaved-changes.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ProductsListComponent },
      {
        path: 'create',
        component: ProductFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: ':id',
        component: ProductFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },
];
