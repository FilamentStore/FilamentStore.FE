import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { SimpleAttributeOption } from '@app/models/config.models';

@Component({
  selector: 'app-material-attribute-tab',
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
  templateUrl: './material-attribute-tab.html',
  styleUrl: './material-attribute-tab.scss',
})
export class MaterialAttributeTabComponent {
  private readonly store = inject(Store);
  private readonly key = 'material';

  readonly simpleAttributes = this.store.selectSignal(selectSimpleAttributes);
  readonly saving = this.store.selectSignal(selectSaving);

  readonly columns = ['name', 'slug', 'actions'];

  readonly showAddRow = signal(false);
  readonly addForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    slug: new FormControl('', [Validators.required]),
  });
  readonly editing = signal<{ oldSlug: string; form: FormGroup } | null>(null);
  readonly confirmDelete = signal<string | null>(null);

  values(): SimpleAttributeOption[] {
    return this.simpleAttributes()[this.key] ?? [];
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

  onEditNameInput(value: string, form: FormGroup): void {
    form.controls['slug'].setValue(this.toSlug(value), { emitEvent: false });
  }

  openAdd(): void {
    this.showAddRow.set(true);
    this.addForm.reset({ name: '', slug: '' });
    this.editing.set(null);
    this.confirmDelete.set(null);
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
    this.addForm.reset();
  }

  submitAdd(): void {
    if (this.addForm.invalid) return;
    const { name, slug } = this.addForm.getRawValue();

    if (!name || !slug) return;
    if (!this.values().some(v => v.slug === slug)) {
      this.store.dispatch(
        ConfigActions.addValue({ key: this.key, option: { name, slug } }),
      );
    }

    this.showAddRow.set(false);
    this.addForm.reset();
  }

  startEdit(opt: SimpleAttributeOption): void {
    const form = new FormGroup({
      name: new FormControl(opt.name, [Validators.required]),
      slug: new FormControl(opt.slug, [Validators.required]),
    });

    this.editing.set({ oldSlug: opt.slug, form });
    this.showAddRow.set(false);
    this.confirmDelete.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  submitEdit(): void {
    const editing = this.editing();

    if (!editing || editing.form.invalid) return;
    const { name, slug } = editing.form.getRawValue();

    if (!name || !slug) return;
    this.store.dispatch(
      ConfigActions.updateValue({
        key: this.key,
        oldSlug: editing.oldSlug,
        option: { name, slug },
      }),
    );
    this.editing.set(null);
  }

  isEditing(slug: string): boolean {
    return this.editing()?.oldSlug === slug;
  }

  askDelete(slug: string): void {
    this.confirmDelete.set(slug);
    this.editing.set(null);
  }

  confirmDeleteAction(): void {
    const slug = this.confirmDelete();

    if (!slug) return;
    this.store.dispatch(ConfigActions.removeValue({ key: this.key, slug }));
    this.confirmDelete.set(null);
  }

  cancelDelete(): void {
    this.confirmDelete.set(null);
  }

  isConfirmingDelete(slug: string): boolean {
    return this.confirmDelete() === slug;
  }
}
