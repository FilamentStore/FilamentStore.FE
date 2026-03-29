import { Routes } from '@angular/router';
import { ROUTES } from '@app/constants/app.routes.const';
import { CrmShellComponent } from '@pages/crm/_layout/crm-shell/crm-shell.component';
import { CrmLoginComponent } from '@pages/crm/auth/crm-login/crm-login.component';
import { DashboardComponent } from '@pages/crm/dashboard/dashboard.component';
import { authGuard } from '@helper/guards/auth.guard';
import { loginGuard } from '@helper/guards/login.guard';

const crm = ROUTES.crm;

export const CRM_ROUTES: Routes = [
  {
    path: crm.auth.root,
    children: [
      {
        path: crm.auth.login,
        canActivate: [loginGuard],
        component: CrmLoginComponent,
      },
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
        loadChildren: () =>
          import('@app/helper/route/products.routes').then(
            m => m.PRODUCTS_ROUTES,
          ),
      },
      {
        path: crm.config,
        loadChildren: () =>
          import('@app/helper/route/config.routes').then(m => m.CONFIG_ROUTES),
      },
    ],
  },
];
