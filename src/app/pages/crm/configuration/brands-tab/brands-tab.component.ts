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
import { Brand } from '@app/models/config.models';
import { BrandsService } from '@app/services/tempService/brands.service';
import { createSlug } from '@app/utils/slug.util';

@Component({
  selector: 'app-brands-tab',
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
  templateUrl: './brands-tab.component.html',
  styleUrl: './brands-tab.component.scss',
})
export class BrandsTabComponent implements OnInit {
  private brandsService = inject(BrandsService);

  brands = signal<Brand[]>([]);
  loading = signal(false);
  saving = signal(false);

  addForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    slug: new FormControl('', [Validators.required]),
  });
  showAddRow = signal(false);

  editingId = signal<number | null>(null);
  editForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    slug: new FormControl('', [Validators.required]),
  });

  confirmDeleteId = signal<number | null>(null);

  displayedColumns = ['name', 'slug', 'usage', 'actions'];

  ngOnInit(): void {
    this.loadBrands();
  }

  toSlug(value: string): string {
    return createSlug(value, {
      existing: this.brands().map(brand => brand.slug),
      exclude:
        this.editingId() === null
          ? null
          : (this.brands().find(brand => brand.id === this.editingId())?.slug ??
            null),
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

  openAdd(): void {
    this.showAddRow.set(true);
    this.addForm.reset({ name: '', slug: '' });
  }

  submitAdd(): void {
    if (this.addForm.invalid) return;
    const { name, slug } = this.addForm.getRawValue();

    this.saving.set(true);
    this.brandsService
      .createBrand(name!, slug!)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: brand => {
          this.brands.update(brands => [...brands, brand]);
          this.showAddRow.set(false);
          this.addForm.reset();
        },
      });
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
    this.addForm.reset();
  }

  startEdit(brand: Brand): void {
    this.editingId.set(brand.id);
    this.editForm.setValue({ name: brand.name, slug: brand.slug });
    this.confirmDeleteId.set(null);
  }

  submitEdit(id: number): void {
    if (this.editForm.invalid) return;
    const { name, slug } = this.editForm.getRawValue();

    this.saving.set(true);
    this.brandsService
      .updateBrand(id, name!, slug!)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: brand => {
          this.brands.update(brands =>
            brands.map(item => (item.id === brand.id ? brand : item)),
          );
          this.editingId.set(null);
        },
      });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  onDeleteClick(id: number): void {
    this.confirmDeleteId.set(id);
    this.editingId.set(null);
  }

  confirmDelete(id: number): void {
    this.saving.set(true);
    this.brandsService
      .deleteBrand(id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.brands.update(brands => brands.filter(brand => brand.id !== id));
          this.confirmDeleteId.set(null);
        },
      });
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  private loadBrands(): void {
    this.loading.set(true);
    this.brandsService
      .getBrands()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: brands => this.brands.set(brands),
        error: () => this.brands.set([]),
      });
  }
}
