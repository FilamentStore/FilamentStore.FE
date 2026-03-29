import { ColorValue, WcCategory } from '@app/models/config.models';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ConfigActions = createActionGroup({
  source: 'Config',
  events: {
    // ─── Load all ─────────────────────────────────────────────────
    'Load Config': emptyProps(),
    'Load Config Success': props<{
      colors: ColorValue[];
      simpleAttributes: Record<string, string[]>;
    }>(),
    'Load Config Failure': props<{ error: string }>(),

    // ─── Colors ───────────────────────────────────────────────────
    'Add Color': props<{ color: ColorValue }>(),
    'Add Color Success': props<{ color: ColorValue }>(),
    'Add Color Failure': props<{ error: string }>(),

    'Update Color': props<{ oldSlug: string; color: ColorValue }>(),
    'Update Color Success': props<{ oldSlug: string; color: ColorValue }>(),
    'Update Color Failure': props<{ error: string }>(),

    'Remove Color': props<{ slug: string }>(),
    'Remove Color Success': props<{ slug: string }>(),
    'Remove Color Failure': props<{ error: string }>(),

    // ─── Simple attribute values ───────────────────────────────────
    'Add Value': props<{ key: string; value: string }>(),
    'Add Value Success': props<{ key: string; value: string }>(),
    'Add Value Failure': props<{ error: string }>(),

    'Update Value': props<{
      key: string;
      oldValue: string;
      newValue: string;
    }>(),
    'Update Value Success': props<{
      key: string;
      oldValue: string;
      newValue: string;
    }>(),
    'Update Value Failure': props<{ error: string }>(),

    'Remove Value': props<{ key: string; value: string }>(),
    'Remove Value Success': props<{ key: string; value: string }>(),
    'Remove Value Failure': props<{ error: string }>(),

    // ─── Categories ───────────────────────────────────────────────
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: WcCategory[] }>(),
    'Load Categories Failure': props<{ error: string }>(),

    'Create Category': props<{ name: string }>(),
    'Create Category Success': props<{ category: WcCategory }>(),
    'Create Category Failure': props<{ error: string }>(),

    'Update Category': props<{ id: number; name: string }>(),
    'Update Category Success': props<{ category: WcCategory }>(),
    'Update Category Failure': props<{ error: string }>(),

    'Delete Category': props<{ id: number }>(),
    'Delete Category Success': props<{ id: number }>(),
    'Delete Category Failure': props<{ error: string }>(),
  },
});
