import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Brand } from '@models/config.models';

@Injectable({ providedIn: 'root' })
export class BrandsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/config/brands`;

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.base);
  }

  createBrand(name: string, slug: string): Observable<Brand> {
    return this.http.post<Brand>(this.base, { name, slug });
  }

  updateBrand(id: number, name: string, slug: string): Observable<Brand> {
    return this.http.put<Brand>(`${this.base}/${id}`, { name, slug });
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
