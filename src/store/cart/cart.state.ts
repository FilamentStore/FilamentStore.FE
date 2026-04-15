export interface CartEntry {
  productId: number;
  variationId: number;
  quantity: number;
}

export interface CartState {
  entries: CartEntry[];
}
