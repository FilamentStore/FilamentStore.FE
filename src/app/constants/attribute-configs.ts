import { AttributeConfig } from '@app/models/config.models';

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
    placeholder: 'Наприклад: 1 кг',
    type: 'simple',
  },
  {
    key: 'diameter',
    label: 'Діаметр',
    icon: 'straighten',
    placeholder: 'Наприклад: 1.75 мм',
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
