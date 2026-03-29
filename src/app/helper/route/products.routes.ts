import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ProductsListComponent } from '@pages/crm/products/products-list/products-list.component';
import { ProductFormComponent } from '@pages/crm/products/product-form/product-form.component';
import { productsFeature } from '@store/products/products.reducer';
import { ProductsEffects } from '@store/products/products.effects';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(productsFeature), provideEffects(ProductsEffects)],
    children: [
      { path: '', component: ProductsListComponent },
      { path: 'create', component: ProductFormComponent },
      { path: ':id', component: ProductFormComponent },
    ],
  },
];
