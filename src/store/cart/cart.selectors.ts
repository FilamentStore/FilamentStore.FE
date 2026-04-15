import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.state';

const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartEntries = createSelector(
  selectCartState,
  s => s.entries,
);

export const selectCartVariationIds = createSelector(
  selectCartEntries,
  entries => entries.map(e => e.variationId),
);

export const selectCartCount = createSelector(selectCartEntries, entries =>
  entries.reduce((sum, e) => sum + e.quantity, 0),
);

export const selectCartItemsCount = createSelector(
  selectCartEntries,
  entries => entries.length,
);
