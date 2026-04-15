import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  Product,
  ProductsListResponse,
  WcCategory,
} from '@models/product.models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products`;

  getProducts(filters: {
    search?: string;
    status?: string;
    category_id?: number | null;
    page?: number;
    include?: number[];
    perPage?: number;
  }): Observable<ProductsListResponse> {
    let params = new HttpParams().set(
      'per_page',
      String(filters.perPage ?? 20),
    );

    if (filters.search) params = params.set('search', filters.search);
    const status = filters.status?.trim() === '' ? 'any' : filters.status;

    if (status) params = params.set('status', status);
    if (filters.category_id != null)
      params = params.set('category_id', String(filters.category_id));
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.include?.length)
      params = params.set('include', filters.include.join(','));

    return this.http.get<ProductsListResponse>(this.baseUrl, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<WcCategory[]> {
    return this.http.get<WcCategory[]>(
      `${environment.apiUrl}/config/categories`,
    );
  }
}
