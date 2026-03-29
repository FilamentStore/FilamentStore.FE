import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ConfigActions } from '../../store/config.actions';
import {
  selectCategories,
  selectLoadingCategories,
  selectSavingCategory,
} from '../../store/config.selectors';
import { WcCategory } from '../../models/config.models';

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

  // inline add
  addControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  showAddRow = signal(false);

  // inline edit
  editingId = signal<number | null>(null);
  editControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);

  // delete confirm
  confirmDeleteId = signal<number | null>(null);

  displayedColumns = ['name', 'slug', 'count', 'actions'];

  ngOnInit(): void {
    this.store.dispatch(ConfigActions.loadCategories());
  }

  // ─── Add ──────────────────────────────────────────────────────────
  openAdd(): void {
    this.showAddRow.set(true);
    this.addControl.reset();
  }

  submitAdd(): void {
    if (this.addControl.invalid) return;
    this.store.dispatch(
      ConfigActions.createCategory({ name: this.addControl.value! }),
    );
    this.showAddRow.set(false);
    this.addControl.reset();
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
    this.addControl.reset();
  }

  // ─── Edit ─────────────────────────────────────────────────────────
  startEdit(cat: WcCategory): void {
    this.editingId.set(cat.id);
    this.editControl.setValue(cat.name);
    this.confirmDeleteId.set(null);
  }

  submitEdit(id: number): void {
    if (this.editControl.invalid) return;
    this.store.dispatch(
      ConfigActions.updateCategory({ id, name: this.editControl.value! }),
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
