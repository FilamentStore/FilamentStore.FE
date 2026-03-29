import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ProductImage } from '../models/product.models';

interface WpMediaResponse {
  id: number;
  source_url: string;
  alt_text: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private http = inject(HttpClient);
  private mediaUrl = `${environment.wpJsonUrl}/wp/v2/media`;

  uploadImage(file: File): Observable<ProductImage> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http
      .post<WpMediaResponse>(this.mediaUrl, formData)
      .pipe(
        map(res => ({ id: res.id, src: res.source_url, alt: res.alt_text })),
      );
  }
}
