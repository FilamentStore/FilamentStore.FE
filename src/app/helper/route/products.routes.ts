import { Routes } from '@angular/router';
import { ProductsListComponent } from '@pages/crm/products/products-list/products-list.component';
import { ProductFormComponent } from '@pages/crm/products/product-form/product-form.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ProductsListComponent },
      { path: 'create', component: ProductFormComponent },
      { path: ':id', component: ProductFormComponent },
    ],
  },
];
