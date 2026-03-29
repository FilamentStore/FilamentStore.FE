import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  selectSaving,
  selectSimpleAttributes,
} from '@store/config/config.selectors';
import { ConfigActions } from '@store/config/config.actions';

@Component({
  selector: 'app-diameter-attribute-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './diameter-attribute-tab.html',
  styleUrl: './diameter-attribute-tab.scss',
})
export class DiameterAttributeTabComponent {
  private readonly store = inject(Store);
  private readonly key = 'diameter';

  readonly simpleAttributes = this.store.selectSignal(selectSimpleAttributes);
  readonly saving = this.store.selectSignal(selectSaving);

  readonly columns = ['value', 'actions'];

  readonly showAddRow = signal(false);
  readonly addControl = new FormControl('', [Validators.required]);
  readonly editing = signal<{ oldValue: string; ctrl: FormControl } | null>(
    null,
  );
  readonly confirmDelete = signal<string | null>(null);

  values(): string[] {
    return this.simpleAttributes()[this.key] ?? [];
  }

  openAdd(): void {
    this.showAddRow.set(true);
    this.addControl.reset();
    this.editing.set(null);
    this.confirmDelete.set(null);
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
    this.addControl.reset();
  }

  submitAdd(): void {
    if (this.addControl.invalid) return;

    const value = this.addControl.value?.trim();

    if (!value) return;

    if (!this.values().includes(value)) {
      this.store.dispatch(ConfigActions.addValue({ key: this.key, value }));
    }

    this.showAddRow.set(false);
    this.addControl.reset();
  }

  startEdit(value: string): void {
    this.editing.set({
      oldValue: value,
      ctrl: new FormControl(value, [Validators.required]),
    });
    this.showAddRow.set(false);
    this.confirmDelete.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  submitEdit(): void {
    const editing = this.editing();

    if (!editing || editing.ctrl.invalid) return;

    const newValue = editing.ctrl.value?.trim();

    if (!newValue) return;

    if (newValue !== editing.oldValue) {
      this.store.dispatch(
        ConfigActions.updateValue({
          key: this.key,
          oldValue: editing.oldValue,
          newValue,
        }),
      );
    }

    this.editing.set(null);
  }

  isEditing(value: string): boolean {
    return this.editing()?.oldValue === value;
  }

  askDelete(value: string): void {
    this.confirmDelete.set(value);
    this.editing.set(null);
  }

  confirmDeleteAction(): void {
    const value = this.confirmDelete();

    if (!value) return;

    this.store.dispatch(
      ConfigActions.removeValue({
        key: this.key,
        value,
      }),
    );

    this.confirmDelete.set(null);
  }

  cancelDelete(): void {
    this.confirmDelete.set(null);
  }

  isConfirmingDelete(value: string): boolean {
    return this.confirmDelete() === value;
  }
}
