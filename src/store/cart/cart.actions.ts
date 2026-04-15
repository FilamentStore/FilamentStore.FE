import { createActionGroup, props } from '@ngrx/store';

export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    Add: props<{ productId: number; variationId: number }>(),
    Remove: props<{ variationId: number }>(),
    'Update Quantity': props<{ variationId: number; quantity: number }>(),
    Clear: props<Record<string, never>>(),
  },
});
