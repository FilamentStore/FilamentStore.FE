export interface ColorValue {
  name: string; // Чорний
  hex: string; // #1a1a1a
  slug: string; // black
}

export interface AttributeConfig {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
  type: 'simple' | 'color';
}

export const ATTRIBUTE_CONFIGS: AttributeConfig[] = [
  {
    key: 'color',
    label: 'Колір',
    icon: 'palette',
    placeholder: 'Наприклад: Чорний',
    type: 'color',
  },
  {
    key: 'material',
    label: 'Матеріал',
    icon: 'science',
    placeholder: 'Наприклад: PLA',
    type: 'simple',
  },
  {
    key: 'weight',
    label: 'Вага',
    icon: 'scale',
    placeholder: 'Наприклад: 1кг',
    type: 'simple',
  },
  {
    key: 'diameter',
    label: 'Діаметр',
    icon: 'straighten',
    placeholder: 'Наприклад: 1.75мм',
    type: 'simple',
  },
  {
    key: 'spool',
    label: 'Розмір котушки',
    icon: 'data_usage',
    placeholder: 'Наприклад: Стандартна',
    type: 'simple',
  },
];

export interface ConfigState {
  colors: ColorValue[];
  simpleAttributes: Record<string, string[]>;
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
