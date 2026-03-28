import { Routes, UrlSegment } from '@angular/router';
import { ROUTES } from './constants/app.routes.const';

export const routes: Routes = [
  // Site — з header та footer (завжди перший, але не матчить /crm)
  {
    path: ROUTES.site.home,
    canMatch: [
      (_route: unknown, segments: UrlSegment[]) =>
        segments[0]?.path !== ROUTES.crm.root,
    ],
    loadComponent: () =>
      import('./pages/site/_layout/site-shell/site-shell.component').then(
        m => m.SiteShellComponent,
      ),
    children: [
      {
        path: ROUTES.site.home,
        loadComponent: () =>
          import('./pages/site/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: ROUTES.site.catalog,
        loadComponent: () =>
          import('./pages/site/catalog/catalog.component').then(
            m => m.CatalogComponent,
          ),
      },
      {
        path: ROUTES.site.about,
        loadComponent: () =>
          import('./pages/site/about/about.component').then(
            m => m.AboutComponent,
          ),
      },
      {
        path: ROUTES.site.account,
        loadComponent: () =>
          import('./pages/site/account/account.component').then(
            m => m.AccountComponent,
          ),
      },
      {
        path: ROUTES.site.favorites,
        loadComponent: () =>
          import('./pages/site/favorites/favorites.component').then(
            m => m.FavoritesComponent,
          ),
      },
      {
        path: ROUTES.site.cart,
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
    path: ROUTES.crm.root,
    loadChildren: () => import('./crm/crm.routes').then(m => m.CRM_ROUTES),
  },
];
