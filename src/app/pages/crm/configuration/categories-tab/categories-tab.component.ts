import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { finalize } from 'rxjs/operators';
import { WcCategory } from '@app/models/config.models';
import { CategoriesService } from '@app/services/tempService/categories.service';
import { MediaService } from '@app/services/tempService/media.service';
import { createSlug } from '@app/utils/slug.util';

@Component({
  selector: 'app-categories-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './categories-tab.component.html',
  styleUrl: './categories-tab.component.scss',
})
export class CategoriesTabComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private mediaService = inject(MediaService);

  categories = signal<WcCategory[]>([]);
  loading = signal(false);
  saving = signal(false);

  // Add form
  addForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    slug: new FormControl('', [Validators.required]),
  });
  showAddRow = signal(false);
  addImagePreview = signal<string | null>(null);
  addImageId = signal<number | null>(null);
  addImageUploading = signal(false);

  // Edit form
  editingId = signal<number | null>(null);
  editForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    slug: new FormControl('', [Validators.required]),
  });
  editImagePreview = signal<string | null>(null);
  editImageId = signal<number | null | undefined>(undefined);
  editImageUploading = signal(false);

  confirmDeleteId = signal<number | null>(null);

  displayedColumns = ['image', 'name', 'slug', 'count', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
  }

  toSlug(value: string): string {
    return createSlug(value, {
      existing: this.categories().map(category => category.slug),
      exclude:
        this.editingId() === null
          ? null
          : (this.categories().find(
              category => category.id === this.editingId(),
            )?.slug ?? null),
    });
  }

  onAddNameInput(value: string): void {
    this.addForm.controls.slug.setValue(this.toSlug(value), {
      emitEvent: false,
    });
  }

  onEditNameInput(value: string): void {
    this.editForm.controls.slug.setValue(this.toSlug(value), {
      emitEvent: false,
    });
  }

  // ─── Image upload ─────────────────────────────────────────────────
  onAddImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;
    this.addImageUploading.set(true);
    const reader = new FileReader();

    reader.onload = e => this.addImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.mediaService
      .uploadImage(file)
      .pipe(finalize(() => this.addImageUploading.set(false)))
      .subscribe({
        next: media => this.addImageId.set(media.id),
        error: () => this.addImagePreview.set(null),
      });
  }

  onEditImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;
    this.editImageUploading.set(true);
    const reader = new FileReader();

    reader.onload = e => this.editImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.mediaService
      .uploadImage(file)
      .pipe(finalize(() => this.editImageUploading.set(false)))
      .subscribe({
        next: media => this.editImageId.set(media.id),
        error: () => this.editImagePreview.set(null),
      });
  }

  removeAddImage(): void {
    this.addImagePreview.set(null);
    this.addImageId.set(null);
  }

  removeEditImage(): void {
    this.editImagePreview.set(null);
    this.editImageId.set(0); // 0 = видалити фото на бекенді
  }

  // ─── Add ──────────────────────────────────────────────────────────
  openAdd(): void {
    this.showAddRow.set(true);
    this.addForm.reset({ name: '', slug: '' });
    this.addImagePreview.set(null);
    this.addImageId.set(null);
  }

  submitAdd(): void {
    if (this.addForm.invalid) return;
    const { name, slug } = this.addForm.getRawValue();
    const imageId = this.addImageId() ?? undefined;

    this.saving.set(true);
    this.categoriesService
      .createCategory(name!, slug!, imageId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: category => {
          this.categories.update(categories => [...categories, category]);
          this.showAddRow.set(false);
          this.addForm.reset();
          this.addImagePreview.set(null);
          this.addImageId.set(null);
        },
      });
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
    this.addForm.reset();
    this.addImagePreview.set(null);
    this.addImageId.set(null);
  }

  // ─── Edit ─────────────────────────────────────────────────────────
  startEdit(cat: WcCategory): void {
    this.editingId.set(cat.id);
    this.editForm.setValue({ name: cat.name, slug: cat.slug });
    this.editImagePreview.set(cat.image?.src ?? null);
    this.editImageId.set(undefined); // undefined = не змінювати
    this.confirmDeleteId.set(null);
  }

  submitEdit(id: number): void {
    if (this.editForm.invalid) return;
    const { name, slug } = this.editForm.getRawValue();
    const imageId = this.editImageId();

    this.saving.set(true);
    this.categoriesService
      .updateCategory(id, name!, slug!, imageId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: category => {
          this.categories.update(categories =>
            categories.map(item => (item.id === category.id ? category : item)),
          );
          this.editingId.set(null);
        },
      });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editImagePreview.set(null);
    this.editImageId.set(undefined);
  }

  // ─── Delete ───────────────────────────────────────────────────────
  onDeleteClick(id: number): void {
    this.confirmDeleteId.set(id);
    this.editingId.set(null);
  }

  confirmDelete(id: number): void {
    this.saving.set(true);
    this.categoriesService
      .deleteCategory(id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.categories.update(categories =>
            categories.filter(category => category.id !== id),
          );
          this.confirmDeleteId.set(null);
        },
      });
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.categoriesService
      .getCategories()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: categories => this.categories.set(categories),
        error: () => this.categories.set([]),
      });
  }
}
