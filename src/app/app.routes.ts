import { Routes, UrlSegment } from '@angular/router';

export const routes: Routes = [
  // Site — з header та footer (завжди перший, але не матчить /crm)
  {
    path: '',
    canMatch: [
      (_route: unknown, segments: UrlSegment[]) => segments[0]?.path !== 'crm',
    ],
    loadComponent: () =>
      import('./pages/site/_layout/site-shell/site-shell.component').then(
        m => m.SiteShellComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/site/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./pages/site/catalog/catalog.component').then(
            m => m.CatalogComponent,
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/site/about/about.component').then(
            m => m.AboutComponent,
          ),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./pages/site/account/account.component').then(
            m => m.AccountComponent,
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./pages/site/favorites/favorites.component').then(
            m => m.FavoritesComponent,
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/site/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/site/not-found/not-found.component').then(
            m => m.NotFoundComponent,
          ),
      },
    ],
  },
  // CRM — повністю ізольований, зі своїм sidenav
  {
    path: 'crm',
    loadChildren: () =>
      import('./pages/crm/crm.routes').then(m => m.CRM_ROUTES),
  },
];
