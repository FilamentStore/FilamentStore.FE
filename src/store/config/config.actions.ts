import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Brand, WcCategory } from '@models/config.models';

export const ConfigActions = createActionGroup({
  source: 'Config',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ categories: WcCategory[]; brands: Brand[] }>(),
    'Load Failure': props<{ error: string }>(),
  },
});
