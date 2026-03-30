import {
  Brand,
  ColorValue,
  SimpleAttributeOption,
  WcCategory,
} from '@app/models/config.models';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ConfigActions = createActionGroup({
  source: 'Config',
  events: {
    // ─── Load all ─────────────────────────────────────────────────
    'Load Config': emptyProps(),
    'Load Config Success': props<{
      colors: ColorValue[];
      simpleAttributes: Record<string, SimpleAttributeOption[]>;
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
    'Add Value': props<{ key: string; option: SimpleAttributeOption }>(),
    'Add Value Success': props<{
      key: string;
      option: SimpleAttributeOption;
    }>(),
    'Add Value Failure': props<{ error: string }>(),

    'Update Value': props<{
      key: string;
      oldSlug: string;
      option: SimpleAttributeOption;
    }>(),
    'Update Value Success': props<{
      key: string;
      oldSlug: string;
      option: SimpleAttributeOption;
    }>(),
    'Update Value Failure': props<{ error: string }>(),

    'Remove Value': props<{ key: string; slug: string }>(),
    'Remove Value Success': props<{ key: string; slug: string }>(),
    'Remove Value Failure': props<{ error: string }>(),

    // ─── Categories ───────────────────────────────────────────────
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: WcCategory[] }>(),
    'Load Categories Failure': props<{ error: string }>(),

    'Create Category': props<{ name: string; slug: string }>(),
    'Create Category Success': props<{ category: WcCategory }>(),
    'Create Category Failure': props<{ error: string }>(),

    'Update Category': props<{ id: number; name: string; slug: string }>(),
    'Update Category Success': props<{ category: WcCategory }>(),
    'Update Category Failure': props<{ error: string }>(),

    'Delete Category': props<{ id: number }>(),
    'Delete Category Success': props<{ id: number }>(),
    'Delete Category Failure': props<{ error: string }>(),

    // ─── Brands ───────────────────────────────────────────────────
    'Load Brands': emptyProps(),
    'Load Brands Success': props<{ brands: Brand[] }>(),
    'Load Brands Failure': props<{ error: string }>(),

    'Create Brand': props<{ name: string; slug: string }>(),
    'Create Brand Success': props<{ brand: Brand }>(),
    'Create Brand Failure': props<{ error: string }>(),

    'Update Brand': props<{ id: number; name: string; slug: string }>(),
    'Update Brand Success': props<{ brand: Brand }>(),
    'Update Brand Failure': props<{ error: string }>(),

    'Delete Brand': props<{ id: number }>(),
    'Delete Brand Success': props<{ id: number }>(),
    'Delete Brand Failure': props<{ error: string }>(),
  },
});
