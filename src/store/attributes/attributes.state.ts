import { ColorValue, SimpleAttributeOption } from '@models/config.models';

export interface AttributesState {
  colors: ColorValue[];
  simpleAttributes: Record<string, SimpleAttributeOption[]>;
  loading: boolean;
}

export const initialAttributesState: AttributesState = {
  colors: [],
  simpleAttributes: {},
  loading: false,
};
