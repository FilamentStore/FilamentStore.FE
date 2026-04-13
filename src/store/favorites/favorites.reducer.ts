import { createReducer, on } from '@ngrx/store';
import { FavoritesActions } from './favorites.actions';
import { FavoritesState } from './favorites.state';
import { STORAGE_KEYS } from '@constants/storage-keys.const';

const initialState: FavoritesState = {
  items: JSON.parse(localStorage.getItem(STORAGE_KEYS.site.favorites) ?? '[]'),
};

export const favoritesReducer = createReducer(
  initialState,
  on(FavoritesActions.toggle, (state, { productId, variationId }) => {
    const exists = state.items.some(i => i.variationId === variationId);
    const items = exists
      ? state.items.filter(i => i.variationId !== variationId)
      : [...state.items, { productId, variationId }];

    localStorage.setItem(STORAGE_KEYS.site.favorites, JSON.stringify(items));

    return { ...state, items };
  }),
);
