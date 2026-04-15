import { createReducer, on } from '@ngrx/store';
import { AttributesActions } from './attributes.actions';
import { initialAttributesState } from './attributes.state';

export const attributesReducer = createReducer(
  initialAttributesState,
  on(AttributesActions.loadAttributes, state => ({ ...state, loading: true })),
  on(AttributesActions.loadAttributesSuccess, (_state, { config }) => ({
    colors: config.colors ?? [],
    simpleAttributes: config.simpleAttributes ?? {},
    loading: false,
  })),
  on(AttributesActions.loadAttributesFailure, state => ({
    ...state,
    loading: false,
  })),
);
