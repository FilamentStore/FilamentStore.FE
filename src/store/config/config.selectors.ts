import { createSelector } from '@ngrx/store';
import { configFeature } from './config.reducer';

export const {
  selectColors,
  selectSimpleAttributes,
  selectCategories,
  selectLoading,
  selectSaving,
  selectLoadingCategories,
  selectSavingCategory,
  selectError,
} = configFeature;

export const selectConfigForSave = createSelector(
  selectColors,
  selectSimpleAttributes,
  (colors, simpleAttributes) => ({
    colors: colors ?? [],
    simpleAttributes: simpleAttributes ?? {},
  }),
);

export const selectColorsSafe = createSelector(
  selectColors,
  colors => colors ?? [],
);

export const selectSimpleAttributesSafe = createSelector(
  selectSimpleAttributes,
  attrs => attrs ?? {},
);
