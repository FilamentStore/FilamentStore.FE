import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AttributesConfig } from '@app/services/tempService/attributes.service';

export const AttributesActions = createActionGroup({
  source: 'Attributes',
  events: {
    'Load Attributes': emptyProps(),
    'Load Attributes Success': props<{ config: AttributesConfig }>(),
    'Load Attributes Failure': emptyProps(),
  },
});
