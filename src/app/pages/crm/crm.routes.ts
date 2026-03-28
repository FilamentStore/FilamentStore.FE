import { Routes } from '@angular/router';

export const CRM_ROUTES: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/crm-login/crm-login.component').then(
            m => m.CrmLoginComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./_layout/crm-shell/crm-shell.component').then(
        m => m.CrmShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            m => m.DashboardComponent,
          ),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./products/product-list/product-list.component').then(
                m => m.ProductListComponent,
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./products/product-create/product-create.component').then(
                m => m.ProductCreateComponent,
              ),
          },
        ],
      },
    ],
  },
];
