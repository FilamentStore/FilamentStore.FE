import { createReducer, on } from '@ngrx/store';
import { ConfigActions } from './config.actions';
import { initialConfigState } from './config.state';

export const configReducer = createReducer(
  initialConfigState,
  on(ConfigActions.load, state => ({ ...state, loading: true, error: null })),
  on(ConfigActions.loadSuccess, (_state, { categories, brands }) => ({
    categories,
    brands,
    loading: false,
    error: null,
  })),
  on(ConfigActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
