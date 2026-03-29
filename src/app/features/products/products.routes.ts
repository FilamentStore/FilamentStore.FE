import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { productsFeature } from './store/products.reducer';
import { ProductsEffects } from './store/products.effects';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

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
