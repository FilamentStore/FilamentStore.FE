import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import {
  FormArray,
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
    hexes: new FormArray([this.newHexControl()]),
    slug: new FormControl('', [Validators.required]),
  });

  get addHexes(): FormArray {
    return this.addForm.get('hexes') as FormArray;
  }

  get editHexes(): FormArray | null {
    const form = this.editingColor()?.form;

    return form ? (form.get('hexes') as FormArray) : null;
  }

  addHexToForm(): void {
    if (this.addHexes.length < 3) {
      this.addHexes.push(this.newHexControl());
    }
  }

  removeHexFromForm(index: number): void {
    if (this.addHexes.length > 1) {
      this.addHexes.removeAt(index);
    }
  }

  addHexToEdit(): void {
    const arr = this.editHexes;

    if (arr && arr.length < 3) {
      arr.push(this.newHexControl());
    }
  }

  removeHexFromEdit(index: number): void {
    const arr = this.editHexes;

    if (arr && arr.length > 1) {
      arr.removeAt(index);
    }
  }

  swatchBackground(hex: string[]): string {
    const colors = this.toHexArray(hex);

    if (colors.length === 1) return colors[0];
    const step = 100 / colors.length;
    const stops = colors
      .flatMap((h, i) => [`${h} ${i * step}%`, `${h} ${(i + 1) * step}%`])
      .join(', ');

    return `linear-gradient(to right, ${stops})`;
  }

  hexTooltip(hex: string[]): string {
    return this.toHexArray(hex).join(' · ');
  }

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
    this.resetAddForm();
  }

  cancelAdd(): void {
    this.showAddRow.set(false);
  }

  submitAdd(): void {
    if (this.addForm.invalid) return;

    const { name, hexes, slug } = this.addForm.getRawValue();

    this.addColor.emit({
      name: name!,
      hex: hexes as string[],
      slug: slug!,
    });

    this.showAddRow.set(false);
    this.resetAddForm();
  }

  startEdit(color: ColorValue): void {
    const hexValues = this.toHexArray(color.hex);
    const hexArray = new FormArray(hexValues.map(h => this.newHexControl(h)));

    const form = new FormGroup({
      name: new FormControl(color.name, [Validators.required]),
      hexes: hexArray,
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

    const { name, hexes, slug } = editing.form.getRawValue();
    const currentColor = this.colorsList.find(
      color => color.slug === editing.oldSlug,
    );

    this.updateColor.emit({
      oldSlug: editing.oldSlug,
      color: {
        name: name!,
        hex: hexes as string[],
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

  private newHexControl(value = '#000000'): FormControl {
    return new FormControl(value, [
      Validators.required,
      Validators.pattern(/^#[0-9a-fA-F]{6}$/),
    ]);
  }

  private toHexArray(hex: string | string[]): string[] {
    return Array.isArray(hex) ? hex : [hex];
  }

  private resetAddForm(): void {
    while (this.addHexes.length > 1) {
      this.addHexes.removeAt(1);
    }

    this.addForm.patchValue({ name: '', slug: '' });
    this.addHexes.at(0).setValue('#000000');
    this.addForm.markAsPristine();
    this.addForm.markAsUntouched();
  }
}
