import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConfigState } from './config.state';

export const selectConfigState = createFeatureSelector<ConfigState>('config');

export const selectCategories = createSelector(
  selectConfigState,
  s => s.categories,
);

export const selectBrands = createSelector(selectConfigState, s => s.brands);

export const selectConfigLoading = createSelector(
  selectConfigState,
  s => s.loading,
);
