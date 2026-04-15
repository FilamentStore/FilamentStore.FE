import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { WcCategory } from '@models/config.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/config/categories`;

  getCategories(): Observable<WcCategory[]> {
    return this.http.get<WcCategory[]>(this.base);
  }

  createCategory(
    name: string,
    slug: string,
    imageId?: number,
  ): Observable<WcCategory> {
    const body: Record<string, unknown> = { name, slug };

    if (imageId != null) body['image_id'] = imageId;

    return this.http.post<WcCategory>(this.base, body);
  }

  updateCategory(
    id: number,
    name: string,
    slug: string,
    imageId?: number | null,
  ): Observable<WcCategory> {
    const body: Record<string, unknown> = { name, slug };

    if (imageId !== undefined) body['image_id'] = imageId ?? 0;

    return this.http.put<WcCategory>(`${this.base}/${id}`, body);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
