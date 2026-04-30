export const ROUTES = {
  site: {
    home: '',
    catalog: 'catalog',
    product: 'product',
    about: 'about',
    account: 'account',
    favorites: 'favorites',
    cart: 'cart',
    checkout: 'checkout',
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
    configuration: {
      root: 'config',
      attributes: 'attributes',
      categories: 'categories',
    },
  },
} as const;
