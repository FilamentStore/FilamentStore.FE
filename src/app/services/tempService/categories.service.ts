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

  createCategory(name: string, slug: string): Observable<WcCategory> {
    return this.http.post<WcCategory>(this.base, { name, slug });
  }

  updateCategory(
    id: number,
    name: string,
    slug: string,
  ): Observable<WcCategory> {
    return this.http.put<WcCategory>(`${this.base}/${id}`, { name, slug });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
