import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface UploadedMedia {
  id: number;
  src: string;
  alt: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private http = inject(HttpClient);

  uploadImage(file: File): Observable<UploadedMedia> {
    const formData = new FormData();

    formData.append('file', file, file.name);
    formData.append('title', file.name);

    return this.http
      .post<{
        id: number;
        source_url: string;
        alt_text: string;
      }>(`${environment.wpJsonUrl}/wp/v2/media`, formData)
      .pipe(
        map(res => ({
          id: res.id,
          src: res.source_url,
          alt: res.alt_text ?? '',
        })),
      );
  }
}
