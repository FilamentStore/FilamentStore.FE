import { createReducer, on } from '@ngrx/store';
import { CartActions } from './cart.actions';
import { CartState } from './cart.state';
import { STORAGE_KEYS } from '@constants/storage-keys.const';

function persist(entries: CartState['entries']): void {
  localStorage.setItem(STORAGE_KEYS.site.cart, JSON.stringify(entries));
}

const initialState: CartState = {
  entries: JSON.parse(localStorage.getItem(STORAGE_KEYS.site.cart) ?? '[]'),
};

export const cartReducer = createReducer(
  initialState,

  on(CartActions.add, (state, { productId, variationId }) => {
    const exists = state.entries.some(e => e.variationId === variationId);
    const entries = exists
      ? state.entries.map(e =>
          e.variationId === variationId
            ? { ...e, quantity: e.quantity + 1 }
            : e,
        )
      : [...state.entries, { productId, variationId, quantity: 1 }];

    persist(entries);

    return { entries };
  }),

  on(CartActions.remove, (state, { variationId }) => {
    const entries = state.entries.filter(e => e.variationId !== variationId);

    persist(entries);

    return { entries };
  }),

  on(CartActions.updateQuantity, (state, { variationId, quantity }) => {
    const entries =
      quantity <= 0
        ? state.entries.filter(e => e.variationId !== variationId)
        : state.entries.map(e =>
            e.variationId === variationId ? { ...e, quantity } : e,
          );

    persist(entries);

    return { entries };
  }),

  on(CartActions.clear, () => {
    persist([]);

    return { entries: [] };
  }),
);
