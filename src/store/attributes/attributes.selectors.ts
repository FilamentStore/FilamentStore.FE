import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttributesState } from './attributes.state';

export const selectAttributesState =
  createFeatureSelector<AttributesState>('attributes');

export const selectAttributeColors = createSelector(
  selectAttributesState,
  s => s.colors,
);

export const selectAttributeSimpleAttributes = createSelector(
  selectAttributesState,
  s => s.simpleAttributes,
);

export const selectAttributesLoading = createSelector(
  selectAttributesState,
  s => s.loading,
);
