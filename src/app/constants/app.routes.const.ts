export const ROUTES = {
  site: {
    home: '',
    catalog: 'catalog',
    about: 'about',
    account: 'account',
    favorites: 'favorites',
    cart: 'cart',
  },
  crm: {
    root: 'crm',
    auth: {
      root: 'auth',
      login: 'login',
    },
    dashboard: 'dashboard',
    products: {
      root: 'products',
      create: 'create',
    },
  },
} as const;
