import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavoritesState } from './favorites.state';

const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');

export const selectFavoriteItems = createSelector(
  selectFavoritesState,
  state => state.items,
);

export const selectFavoriteVariationIds = createSelector(
  selectFavoriteItems,
  items => items.map(i => i.variationId),
);

export const selectFavoritesCount = createSelector(
  selectFavoriteItems,
  items => items.length,
);
