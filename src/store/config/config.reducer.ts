import { createFeature, createReducer, on } from '@ngrx/store';
import { ConfigActions } from './config.actions';
import { SimpleAttributeOption } from '@app/models/config.models';
import { WcCategory } from '@app/models/product.models';

const STORAGE_KEY = 'fs_config_v2';

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

function migrateSimpleAttributes(
  raw: Record<string, unknown>,
): Record<string, SimpleAttributeOption[]> {
  const result: Record<string, SimpleAttributeOption[]> = {};

  for (const [key, values] of Object.entries(raw)) {
    if (Array.isArray(values)) {
      result[key] = values.map(v => {
        if (typeof v === 'string') {
          return {
            name: v,
            slug: v
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
          };
        }

        return v as SimpleAttributeOption;
      });
    }
  }

  return result;
}

function loadFromStorage(): Pick<FullState, 'colors' | 'simpleAttributes'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      return {
        colors: parsed.colors ?? [],
        simpleAttributes: migrateSimpleAttributes(
          parsed.simpleAttributes ?? {},
        ),
      };
    }
  } catch {
    /* empty */
  }

  return { colors: [], simpleAttributes: {} };
}

function persist(state: FullState): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      colors: state.colors,
      simpleAttributes: state.simpleAttributes,
    }),
  );
}

const stored = loadFromStorage();

const initialState: FullState = {
  colors: stored.colors,
  simpleAttributes: stored.simpleAttributes,
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
      (state, { colors, simpleAttributes }) => {
        const next = { ...state, loading: false, colors, simpleAttributes };

        persist(next);

        return next;
      },
    ),
    on(ConfigActions.loadConfigFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // ─── Colors ──────────────────────────────────────────────────────
    on(ConfigActions.addColor, state => ({ ...state, saving: true })),
    on(ConfigActions.addColorSuccess, (state, { color }) => {
      const next = {
        ...state,
        saving: false,
        colors: [...state.colors, color],
      };

      persist(next);

      return next;
    }),
    on(ConfigActions.addColorFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    on(ConfigActions.updateColor, state => ({ ...state, saving: true })),
    on(ConfigActions.updateColorSuccess, (state, { oldSlug, color }) => {
      const next = {
        ...state,
        saving: false,
        colors: state.colors.map(c => (c.slug === oldSlug ? color : c)),
      };

      persist(next);

      return next;
    }),
    on(ConfigActions.updateColorFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    on(ConfigActions.removeColorSuccess, (state, { slug }) => {
      const next = {
        ...state,
        colors: state.colors.filter(c => c.slug !== slug),
      };

      persist(next);

      return next;
    }),

    // ─── Simple values ────────────────────────────────────────────────
    on(ConfigActions.addValue, state => ({ ...state, saving: true })),
    on(ConfigActions.addValueSuccess, (state, { key, option }) => {
      const next = {
        ...state,
        saving: false,
        simpleAttributes: {
          ...state.simpleAttributes,
          [key]: [...(state.simpleAttributes[key] ?? []), option],
        },
      };

      persist(next);

      return next;
    }),
    on(ConfigActions.addValueFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    on(ConfigActions.updateValueSuccess, (state, { key, oldSlug, option }) => {
      const next = {
        ...state,
        simpleAttributes: {
          ...state.simpleAttributes,
          [key]: (state.simpleAttributes[key] ?? []).map(o =>
            o.slug === oldSlug ? option : o,
          ),
        },
      };

      persist(next);

      return next;
    }),

    on(ConfigActions.removeValueSuccess, (state, { key, slug }) => {
      const next = {
        ...state,
        simpleAttributes: {
          ...state.simpleAttributes,
          [key]: (state.simpleAttributes[key] ?? []).filter(
            o => o.slug !== slug,
          ),
        },
      };

      persist(next);

      return next;
    }),

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
