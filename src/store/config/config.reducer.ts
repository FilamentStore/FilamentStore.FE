import { createFeature, createReducer, on } from '@ngrx/store';
import { ConfigActions } from './config.actions';
import { SimpleAttributeOption } from '@app/models/config.models';
import { WcCategory } from '@app/models/product.models';

interface FullState {
  colors: { name: string; hex: string; slug: string }[];
  simpleAttributes: Record<string, SimpleAttributeOption[]>;
  categories: WcCategory[];
  loading: boolean;
  saving: boolean;
  loadingCategories: boolean;
  savingCategory: boolean;
  error: string | null;
}

const initialState: FullState = {
  colors: [],
  simpleAttributes: {},
  categories: [],
  loading: false,
  saving: false,
  loadingCategories: false,
  savingCategory: false,
  error: null,
};

export const configFeature = createFeature({
  name: 'config',
  reducer: createReducer(
    initialState,

    // ─── Load config ─────────────────────────────────────────────────
    on(ConfigActions.loadConfig, state => ({ ...state, loading: true })),
    on(
      ConfigActions.loadConfigSuccess,
      (state, { colors, simpleAttributes }) => ({
        ...state,
        loading: false,
        colors,
        simpleAttributes,
      }),
    ),
    on(ConfigActions.loadConfigFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // ─── Colors ──────────────────────────────────────────────────────
    on(ConfigActions.addColor, state => ({ ...state, saving: true })),
    on(ConfigActions.addColorSuccess, (state, { color }) => ({
      ...state,
      saving: false,
      colors: [...state.colors, color],
    })),
    on(ConfigActions.addColorFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    on(ConfigActions.updateColor, state => ({ ...state, saving: true })),
    on(ConfigActions.updateColorSuccess, (state, { oldSlug, color }) => ({
      ...state,
      saving: false,
      colors: state.colors.map(c => (c.slug === oldSlug ? color : c)),
    })),
    on(ConfigActions.updateColorFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    on(ConfigActions.removeColorSuccess, (state, { slug }) => ({
      ...state,
      colors: state.colors.filter(c => c.slug !== slug),
    })),

    // ─── Simple values ────────────────────────────────────────────────
    on(ConfigActions.addValue, state => ({ ...state, saving: true })),
    on(ConfigActions.addValueSuccess, (state, { key, option }) => ({
      ...state,
      saving: false,
      simpleAttributes: {
        ...state.simpleAttributes,
        [key]: [...(state.simpleAttributes[key] ?? []), option],
      },
    })),
    on(ConfigActions.addValueFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    on(ConfigActions.updateValueSuccess, (state, { key, oldSlug, option }) => ({
      ...state,
      simpleAttributes: {
        ...state.simpleAttributes,
        [key]: (state.simpleAttributes[key] ?? []).map(o =>
          o.slug === oldSlug ? option : o,
        ),
      },
    })),

    on(ConfigActions.removeValueSuccess, (state, { key, slug }) => ({
      ...state,
      simpleAttributes: {
        ...state.simpleAttributes,
        [key]: (state.simpleAttributes[key] ?? []).filter(o => o.slug !== slug),
      },
    })),

    // ─── Categories ──────────────────────────────────────────────────
    on(ConfigActions.loadCategories, state => ({
      ...state,
      loadingCategories: true,
      error: null,
    })),
    on(ConfigActions.loadCategoriesSuccess, (state, { categories }) => ({
      ...state,
      loadingCategories: false,
      categories,
    })),
    on(ConfigActions.loadCategoriesFailure, (state, { error }) => ({
      ...state,
      loadingCategories: false,
      error,
    })),

    on(ConfigActions.createCategory, state => ({
      ...state,
      savingCategory: true,
    })),
    on(ConfigActions.createCategorySuccess, (state, { category }) => ({
      ...state,
      savingCategory: false,
      categories: [...state.categories, category],
    })),
    on(ConfigActions.createCategoryFailure, (state, { error }) => ({
      ...state,
      savingCategory: false,
      error,
    })),

    on(ConfigActions.updateCategory, state => ({
      ...state,
      savingCategory: true,
    })),
    on(ConfigActions.updateCategorySuccess, (state, { category }) => ({
      ...state,
      savingCategory: false,
      categories: state.categories.map(c =>
        c.id === category.id ? category : c,
      ),
    })),
    on(ConfigActions.updateCategoryFailure, (state, { error }) => ({
      ...state,
      savingCategory: false,
      error,
    })),

    on(ConfigActions.deleteCategorySuccess, (state, { id }) => ({
      ...state,
      categories: state.categories.filter(c => c.id !== id),
    })),
  ),
});
