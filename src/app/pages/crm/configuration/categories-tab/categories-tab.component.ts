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
import { MatChipsModule } from '@angular/material/chips';
import {
  selectCategories,
  selectLoadingCategories,
  selectSavingCategory,
} from '@store/config/config.selectors';
import { ConfigActions } from '@store/config/config.actions';
import { WcCategory } from '@app/models/product.models';

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
  private store = inject(Store);

  categories = this.store.selectSignal(selectCategories);
  loading = this.store.selectSignal(selectLoadingCategories);
  saving = this.store.selectSignal(selectSavingCategory);

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

  displayedColumns = ['name', 'slug', 'count', 'actions'];

  ngOnInit(): void {
    this.store.dispatch(ConfigActions.loadCategories());
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

  // ─── Add ──────────────────────────────────────────────────────────
  openAdd(): void {
    this.showAddRow.set(true);
    this.addForm.reset({ name: '', slug: '' });
  }

  submitAdd(): void {
    if (this.addForm.invalid) return;
    const { name, slug } = this.addForm.getRawValue();

    this.store.dispatch(
      ConfigActions.createCategory({ name: name!, slug: slug! }),
    );
    this.showAddRow.set(false);
    this.addForm.reset();
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
    this.addForm.reset();
  }

  // ─── Edit ─────────────────────────────────────────────────────────
  startEdit(cat: WcCategory): void {
    this.editingId.set(cat.id);
    this.editForm.setValue({ name: cat.name, slug: cat.slug });
    this.confirmDeleteId.set(null);
  }

  submitEdit(id: number): void {
    if (this.editForm.invalid) return;
    const { name, slug } = this.editForm.getRawValue();

    this.store.dispatch(
      ConfigActions.updateCategory({ id, name: name!, slug: slug! }),
    );
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  // ─── Delete ───────────────────────────────────────────────────────
  onDeleteClick(id: number): void {
    this.confirmDeleteId.set(id);
    this.editingId.set(null);
  }

  confirmDelete(id: number): void {
    this.store.dispatch(ConfigActions.deleteCategory({ id }));
    this.confirmDeleteId.set(null);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }
}
