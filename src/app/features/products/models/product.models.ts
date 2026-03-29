export interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  options: string[];
  variation: true;
  visible: true;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category_id: number;
  short_description: string;
  description: string;
  images: ProductImage[];
  status: 'publish' | 'draft' | 'private';
  slug: string;
  type: 'variable';
  attributes: ProductAttribute[];
  low_stock_count?: number;
  variations_count?: number;
}

export interface ProductVariation {
  id: number;
  attributes: { name: string; option: string }[];
  image?: ProductImage;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  manage_stock: true;
  sku: string;
  status: 'publish' | 'private';
  weight: string;
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductsListResponse {
  products: Product[];
  total: number;
  total_pages: number;
}

export interface ProductFilters {
  search: string;
  status: string;
  category_id: number | null;
  page: number;
}

export interface ProductsPagination {
  total: number;
  totalPages: number;
}

export interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  variations: ProductVariation[];
  categories: WcCategory[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: ProductsPagination;
}

export interface AttributeValue {
  name: string;
  options: string[];
}
