import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  Product,
  ProductVariation,
  ProductsListResponse,
  WcCategory,
} from '../models/product.models';

export const ProductsActions = createActionGroup({
  source: 'Products',
  events: {
    // ─── Products list ───────────────────────────────────────────────
    'Load Products': props<{
      search?: string;
      status?: string;
      category_id?: number | null;
      page?: number;
    }>(),
    'Load Products Success': props<{ response: ProductsListResponse }>(),
    'Load Products Failure': props<{ error: string }>(),

    // ─── Single product ──────────────────────────────────────────────
    'Load Product': props<{ id: number }>(),
    'Load Product Success': props<{ product: Product }>(),
    'Load Product Failure': props<{ error: string }>(),

    // ─── Create ──────────────────────────────────────────────────────
    'Create Product': props<{ product: Partial<Product> }>(),
    'Create Product Success': props<{ product: Product }>(),
    'Create Product Failure': props<{ error: string }>(),

    // ─── Update ──────────────────────────────────────────────────────
    'Update Product': props<{ id: number; product: Partial<Product> }>(),
    'Update Product Success': props<{ product: Product }>(),
    'Update Product Failure': props<{ error: string }>(),

    // ─── Delete ──────────────────────────────────────────────────────
    'Delete Product': props<{ id: number }>(),
    'Delete Product Success': props<{ id: number }>(),
    'Delete Product Failure': props<{ error: string }>(),

    // ─── Variations ──────────────────────────────────────────────────
    'Load Variations': props<{ productId: number }>(),
    'Load Variations Success': props<{ variations: ProductVariation[] }>(),
    'Load Variations Failure': props<{ error: string }>(),

    'Create Variation': props<{
      productId: number;
      variation: Partial<ProductVariation>;
    }>(),
    'Create Variation Success': props<{ variation: ProductVariation }>(),
    'Create Variation Failure': props<{ error: string }>(),

    'Update Variation': props<{
      productId: number;
      variationId: number;
      variation: Partial<ProductVariation>;
    }>(),
    'Update Variation Success': props<{ variation: ProductVariation }>(),
    'Update Variation Failure': props<{ error: string }>(),

    // ─── Categories ──────────────────────────────────────────────────
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: WcCategory[] }>(),
    'Load Categories Failure': props<{ error: string }>(),

    // ─── Filters & misc ──────────────────────────────────────────────
    'Set Filters': props<{
      search?: string;
      status?: string;
      category_id?: number | null;
      page?: number;
    }>(),
    'Clear Selected Product': emptyProps(),
  },
});
