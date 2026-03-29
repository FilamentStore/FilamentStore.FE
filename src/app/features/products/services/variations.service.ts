import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ProductVariation } from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class VariationsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

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
}
