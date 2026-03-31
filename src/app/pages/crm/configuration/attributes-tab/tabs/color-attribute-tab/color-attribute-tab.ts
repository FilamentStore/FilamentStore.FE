import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColorValue } from '@app/models/config.models';
import { createSlug } from '@app/utils/slug.util';
import { getUsageLabel, isValueUsed } from '../attribute-usage.util';

@Component({
  selector: 'app-color-attribute-tab',
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
  ],
  templateUrl: './color-attribute-tab.html',
  styleUrl: './color-attribute-tab.scss',
})
export class ColorAttributeTabComponent {
  @Input() colorsList: ColorValue[] = [];
  @Input() saving = false;
  @Output() addColor = new EventEmitter<ColorValue>();
  @Output() updateColor = new EventEmitter<{
    oldSlug: string;
    color: ColorValue;
  }>();
  @Output() removeColor = new EventEmitter<string>();

  readonly colorColumns = [
    'preview',
    'name',
    'hex',
    'slug',
    'usage',
    'actions',
  ];
  readonly showAddRow = signal(false);
  readonly editingColor = signal<{ oldSlug: string; form: FormGroup } | null>(
    null,
  );
  readonly confirmDeleteColor = signal<string | null>(null);

  readonly addForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    hex: new FormControl('#000000', [
      Validators.required,
      Validators.pattern(/^#[0-9a-fA-F]{6}$/),
    ]),
    slug: new FormControl('', [Validators.required]),
  });

  colors(): ColorValue[] {
    return this.colorsList;
  }

  onNameInput(value: string): void {
    this.addForm.controls.slug.setValue(
      createSlug(value, {
        existing: this.colorsList.map(color => color.slug),
      }),
      { emitEvent: false },
    );
  }

  onEditNameInput(value: string, form: FormGroup): void {
    if (this.isUsedBySlug(this.editingColor()?.oldSlug ?? null)) {
      return;
    }

    form.controls['slug'].setValue(
      createSlug(value, {
        existing: this.colorsList.map(color => color.slug),
        exclude: this.editingColor()?.oldSlug ?? null,
      }),
      { emitEvent: false },
    );
  }

  openAdd(): void {
    this.showAddRow.set(true);
    this.editingColor.set(null);
    this.confirmDeleteColor.set(null);
    this.addForm.reset({
      name: '',
      hex: '#000000',
      slug: '',
    });
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
  }

  submitAdd(): void {
    if (this.addForm.invalid) return;

    const { name, hex, slug } = this.addForm.getRawValue();

    this.addColor.emit({
      name: name!,
      hex: hex!,
      slug: slug!,
    });

    this.showAddRow.set(false);
    this.addForm.reset({
      name: '',
      hex: '#000000',
      slug: '',
    });
  }

  startEdit(color: ColorValue): void {
    const form = new FormGroup({
      name: new FormControl(color.name, [Validators.required]),
      hex: new FormControl(color.hex, [
        Validators.required,
        Validators.pattern(/^#[0-9a-fA-F]{6}$/),
      ]),
      slug: new FormControl(color.slug, [Validators.required]),
    });

    if (this.isUsed(color)) {
      form.controls.slug.disable({ emitEvent: false });
    }

    this.editingColor.set({
      oldSlug: color.slug,
      form,
    });

    this.showAddRow.set(false);
    this.confirmDeleteColor.set(null);
  }

  cancelEdit(): void {
    this.editingColor.set(null);
  }

  submitEdit(): void {
    const editing = this.editingColor();

    if (!editing || editing.form.invalid) return;

    const { name, hex, slug } = editing.form.getRawValue();
    const currentColor = this.colorsList.find(
      color => color.slug === editing.oldSlug,
    );

    this.updateColor.emit({
      oldSlug: editing.oldSlug,
      color: {
        name: name!,
        hex: hex!,
        slug: slug!,
        usageCount: currentColor?.usageCount,
      },
    });

    this.editingColor.set(null);
  }

  isEditing(slug: string): boolean {
    return this.editingColor()?.oldSlug === slug;
  }

  askDelete(slug: string): void {
    if (this.isUsedBySlug(slug)) {
      return;
    }

    this.confirmDeleteColor.set(slug);
    this.editingColor.set(null);
  }

  confirmDelete(): void {
    const slug = this.confirmDeleteColor();

    if (!slug) return;

    this.removeColor.emit(slug);
    this.confirmDeleteColor.set(null);
  }

  cancelDelete(): void {
    this.confirmDeleteColor.set(null);
  }

  isUsed(color: ColorValue): boolean {
    return isValueUsed(color);
  }

  isUsedBySlug(slug: string | null): boolean {
    if (!slug) {
      return false;
    }

    return this.colorsList.some(
      color => color.slug === slug && this.isUsed(color),
    );
  }

  usageLabel(usageCount?: number): string {
    return getUsageLabel(usageCount ?? 0);
  }

  deleteTooltip(color: ColorValue): string {
    return this.isUsed(color)
      ? `Значення використовується: ${this.usageLabel(color.usageCount)}`
      : 'Видалити';
  }

  slugEditHint(color: ColorValue): string {
    return this.isUsed(color)
      ? `Слаг заблоковано: ${this.usageLabel(color.usageCount)}`
      : 'Системна назва';
  }
}
