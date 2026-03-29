export interface ColorValue {
  name: string; // Чорний
  hex: string; // #1a1a1a
  slug: string; // black
}

export interface SimpleAttributeOption {
  name: string; // PLA
  slug: string; // pla
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

// WcCategory — використовується у products
export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}
