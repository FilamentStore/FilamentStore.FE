import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CatalogFilters,
  CatalogVariationsResponse,
  ProductVariation,
} from '@app/models/product.models';

@Injectable({ providedIn: 'root' })
export class VariationsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getCatalogVariations(
    filters: CatalogFilters = {},
  ): Observable<CatalogVariationsResponse> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 1))
      .set('per_page', String(filters.per_page ?? 24));

    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.category_id)
      params = params.set('category_id', String(filters.category_id));
    if (filters.brand) params = params.set('brand', filters.brand);
    if (filters.search) params = params.set('search', filters.search);

    // dynamic attribute_* filters
    for (const key of Object.keys(filters)) {
      if (key.startsWith('attribute_') && filters[key] != null) {
        params = params.set(key, String(filters[key]));
      }
    }

    return this.http.get<CatalogVariationsResponse>(
      `${this.baseUrl}/variations`,
      { params },
    );
  }

  getVariations(productId: number): Observable<ProductVariation[]> {
    return this.http.get<ProductVariation[]>(
      `${this.baseUrl}/products/${productId}/variations`,
    );
  }

  createVariation(
    productId: number,
    variation: Partial<ProductVariation>,
  ): Observable<ProductVariation> {
    return this.http.post<ProductVariation>(
      `${this.baseUrl}/products/${productId}/variations`,
      variation,
    );
  }

  updateVariation(
    productId: number,
    variationId: number,
    variation: Partial<ProductVariation>,
  ): Observable<ProductVariation> {
    return this.http.put<ProductVariation>(
      `${this.baseUrl}/products/${productId}/variations/${variationId}`,
      variation,
    );
  }

  deleteVariation(productId: number, variationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/products/${productId}/variations/${variationId}`,
    );
  }
}
