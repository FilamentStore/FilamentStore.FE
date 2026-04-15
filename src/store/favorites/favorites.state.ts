export interface FavoriteItem {
  productId: number;
  variationId: number;
}

export interface FavoritesState {
  items: FavoriteItem[];
}
