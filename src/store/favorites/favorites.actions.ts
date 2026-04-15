import { createActionGroup, props } from '@ngrx/store';

export const FavoritesActions = createActionGroup({
  source: 'Favorites',
  events: {
    Toggle: props<{ productId: number; variationId: number }>(),
  },
});
