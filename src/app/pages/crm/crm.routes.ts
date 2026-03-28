import { Routes } from '@angular/router';
import { ROUTES } from '../../app.routes.const';
import { CrmShellComponent } from './_layout/crm-shell/crm-shell.component';
import { CrmLoginComponent } from './auth/crm-login/crm-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { authGuard } from './core/guards/auth.guard';

const crm = ROUTES.crm;

export const CRM_ROUTES: Routes = [
  {
    path: crm.auth.root,
    children: [
      { path: crm.auth.login, component: CrmLoginComponent },
      { path: '', redirectTo: crm.auth.login, pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: CrmShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: crm.dashboard, pathMatch: 'full' },
      { path: crm.dashboard, component: DashboardComponent },
      {
        path: crm.products.root,
        children: [
          { path: '', component: ProductListComponent },
          { path: crm.products.create, component: ProductCreateComponent },
        ],
      },
    ],
  },
];
