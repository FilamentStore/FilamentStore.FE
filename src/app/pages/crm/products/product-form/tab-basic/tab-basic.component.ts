import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MediaService } from '@services/tempService/media.service';
import { ProductImage, WcCategory } from '@models/product.models';
import { Brand } from '@models/config.models';

@Component({
  selector: 'app-tab-basic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DragDropModule,
  ],
  templateUrl: './tab-basic.component.html',
  styleUrl: './tab-basic.component.scss',
})
export class TabBasicComponent implements OnInit {
  @Input({ required: true }) form!: FormGroup;
  @Input() categories: WcCategory[] = [];
  @Input() brands: Brand[] = [];
  @Input() images: ProductImage[] = [];
  @Input() onImagesChange!: (images: ProductImage[]) => void;

  private mediaService = inject(MediaService);

  uploadingIndex = signal<number | null>(null);
  uploadError = signal<string | null>(null);

  statusOptions = [
    { value: 'publish', label: 'Активний' },
    { value: 'draft', label: 'Чернетка' },
    { value: 'private', label: 'Прихований' },
  ];

  ngOnInit(): void {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.uploadError.set(null);
    this.uploadingIndex.set(this.images.length);

    this.mediaService.uploadImage(file).subscribe({
      next: image => {
        this.uploadingIndex.set(null);
        this.onImagesChange([...this.images, image]);
        input.value = '';
      },
      error: () => {
        this.uploadingIndex.set(null);
        this.uploadError.set('Помилка завантаження зображення');
        input.value = '';
      },
    });
  }

  removeImage(index: number): void {
    const updated = [...this.images];

    updated.splice(index, 1);
    this.onImagesChange(updated);
  }

  onImageDrop(event: CdkDragDrop<ProductImage[]>): void {
    const updated = [...this.images];

    moveItemInArray(updated, event.previousIndex, event.currentIndex);
    this.onImagesChange(updated);
  }

  triggerFileInput(): void {
    const input = document.getElementById('gallery-upload') as HTMLInputElement;

    input?.click();
  }
}
