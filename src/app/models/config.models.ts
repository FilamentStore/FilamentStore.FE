export interface ColorValue {
  name: string;
  hex: string;
  slug: string;
  usageCount?: number;
}

export interface SimpleAttributeOption {
  name: string;
  slug: string;
  usageCount?: number;
}

export interface AttributeConfig {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
  type: 'simple' | 'color';
}

export interface ConfigState {
  colors: ColorValue[];
  simpleAttributes: Record<string, SimpleAttributeOption[]>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}
