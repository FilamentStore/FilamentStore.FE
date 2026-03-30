import { createFeature, createReducer, on } from '@ngrx/store';
import { ProductsActions } from './products.actions';
import { ProductsState } from '@app/models/product.models';

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  variations: [],
  categories: [],
  loading: false,
  saving: false,
  error: null,
  filters: {
    search: '',
    status: '',
    category_id: null,
    page: 1,
  },
  pagination: {
    total: 0,
    totalPages: 0,
  },
};

export const productsFeature = createFeature({
  name: 'products',
  reducer: createReducer(
    initialState,

    // ─── Products list ───────────────────────────────────────────────
    on(ProductsActions.loadProducts, state => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ProductsActions.loadProductsSuccess, (state, { response }) => ({
      ...state,
      loading: false,
      products: response.products,
      pagination: {
        total: response.total,
        totalPages: response.total_pages,
      },
    })),
    on(ProductsActions.loadProductsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // ─── Single product ──────────────────────────────────────────────
    on(ProductsActions.loadProduct, state => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ProductsActions.loadProductSuccess, (state, { product }) => ({
      ...state,
      loading: false,
      selectedProduct: product,
    })),
    on(ProductsActions.loadProductFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // ─── Create ──────────────────────────────────────────────────────
    on(ProductsActions.createProduct, state => ({
      ...state,
      saving: true,
      error: null,
    })),
    on(ProductsActions.createProductSuccess, (state, { product }) => ({
      ...state,
      saving: false,
      selectedProduct: product,
      products: [product, ...state.products],
    })),
    on(ProductsActions.createProductFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    // ─── Update ──────────────────────────────────────────────────────
    on(ProductsActions.updateProduct, state => ({
      ...state,
      saving: true,
      error: null,
    })),
    on(ProductsActions.updateProductSuccess, (state, { product }) => ({
      ...state,
      saving: false,
      selectedProduct: product,
      products: state.products.map(p => (p.id === product.id ? product : p)),
    })),
    on(ProductsActions.updateProductFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    // ─── Delete ──────────────────────────────────────────────────────
    on(ProductsActions.deleteProduct, state => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ProductsActions.deleteProductSuccess, (state, { id }) => ({
      ...state,
      loading: false,
      products: state.products.filter(p => p.id !== id),
    })),
    on(ProductsActions.deleteProductFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // ─── Variations ──────────────────────────────────────────────────
    on(ProductsActions.loadVariationsSuccess, (state, { variations }) => ({
      ...state,
      variations,
    })),
    on(ProductsActions.createVariationSuccess, (state, { variation }) => ({
      ...state,
      variations: [...state.variations, variation],
    })),
    on(ProductsActions.updateVariationSuccess, (state, { variation }) => ({
      ...state,
      variations: state.variations.map(v =>
        v.id === variation.id ? variation : v,
      ),
    })),
    on(ProductsActions.deleteVariationSuccess, (state, { variationId }) => ({
      ...state,
      variations: state.variations.filter(v => v.id !== variationId),
    })),

    // ─── Categories ──────────────────────────────────────────────────
    on(ProductsActions.loadCategoriesSuccess, (state, { categories }) => ({
      ...state,
      categories,
    })),

    // ─── Filters & misc ──────────────────────────────────────────────
    on(ProductsActions.setFilters, (state, filters) => ({
      ...state,
      filters: { ...state.filters, ...filters },
    })),
    on(ProductsActions.clearSelectedProduct, state => ({
      ...state,
      selectedProduct: null,
      variations: [],
    })),
  ),
});
