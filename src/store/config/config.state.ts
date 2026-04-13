import { Brand, WcCategory } from '@models/config.models';

export interface ConfigState {
  categories: WcCategory[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

export const initialConfigState: ConfigState = {
  categories: [],
  brands: [],
  loading: false,
  error: null,
};
