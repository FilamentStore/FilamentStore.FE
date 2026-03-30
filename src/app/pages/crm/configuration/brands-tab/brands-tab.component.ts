import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  selectBrands,
  selectLoadingBrands,
  selectSavingBrand,
} from '@store/config/config.selectors';
import { ConfigActions } from '@store/config/config.actions';
import { Brand } from '@app/models/config.models';

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
  ],
  templateUrl: './brands-tab.component.html',
  styleUrl: './brands-tab.component.scss',
})
export class BrandsTabComponent implements OnInit {
  private store = inject(Store);

  brands = this.store.selectSignal(selectBrands);
  loading = this.store.selectSignal(selectLoadingBrands);
  saving = this.store.selectSignal(selectSavingBrand);

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

  displayedColumns = ['name', 'slug', 'actions'];

  ngOnInit(): void {
    this.store.dispatch(ConfigActions.loadBrands());
  }

  toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
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

    this.store.dispatch(
      ConfigActions.createBrand({ name: name!, slug: slug! }),
    );
    this.showAddRow.set(false);
    this.addForm.reset();
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

    this.store.dispatch(
      ConfigActions.updateBrand({ id, name: name!, slug: slug! }),
    );
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  onDeleteClick(id: number): void {
    this.confirmDeleteId.set(id);
    this.editingId.set(null);
  }

  confirmDelete(id: number): void {
    this.store.dispatch(ConfigActions.deleteBrand({ id }));
    this.confirmDeleteId.set(null);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }
}
