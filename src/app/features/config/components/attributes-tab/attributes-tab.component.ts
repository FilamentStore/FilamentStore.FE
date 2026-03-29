import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfigActions } from '../../store/config.actions';
import {
  selectColors,
  selectSimpleAttributes,
  selectSaving,
} from '../../store/config.selectors';
import { ATTRIBUTE_CONFIGS, ColorValue } from '../../models/config.models';

@Component({
  selector: 'app-attributes-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './attributes-tab.component.html',
  styleUrl: './attributes-tab.component.scss',
})
export class AttributesTabComponent implements OnInit {
  private store = inject(Store);

  colors = this.store.selectSignal(selectColors);
  simpleAttributes = this.store.selectSignal(selectSimpleAttributes);
  saving = this.store.selectSignal(selectSaving);

  configs = ATTRIBUTE_CONFIGS;
  simpleColumns = ['value', 'actions'];
  colorColumns = ['preview', 'name', 'hex', 'slug', 'actions'];

  // ── Simple attribute state ────────────────────────────────────────
  addControls: Record<string, FormControl> = {};
  showAddRow = signal<string | null>(null);
  editingSimple = signal<{
    key: string;
    oldValue: string;
    ctrl: FormControl;
  } | null>(null);
  confirmDeleteSimple = signal<{ key: string; value: string } | null>(null);

  // ── Color state ───────────────────────────────────────────────────
  showColorAddRow = signal(false);
  editingColor = signal<{ oldSlug: string; form: FormGroup } | null>(null);
  confirmDeleteColor = signal<string | null>(null); // slug

  colorAddForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    hex: new FormControl('#000000', [
      Validators.required,
      Validators.pattern(/^#[0-9a-fA-F]{6}$/),
    ]),
    slug: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.store.dispatch(ConfigActions.loadConfig());
    this.configs
      .filter(c => c.type === 'simple')
      .forEach(c => {
        this.addControls[c.key] = new FormControl('', [Validators.required]);
      });
  }

  getSimpleValues(key: string): string[] {
    return this.simpleAttributes()[key] ?? [];
  }

  // auto-generate slug from name
  onColorNameInput(value: string): void {
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    this.colorAddForm.controls.slug.setValue(slug, { emitEvent: false });
  }

  onEditColorNameInput(value: string, form: FormGroup): void {
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    form.controls['slug'].setValue(slug, { emitEvent: false });
  }

  // ── Color CRUD ────────────────────────────────────────────────────
  openColorAdd(): void {
    this.showColorAddRow.set(true);
    this.colorAddForm.reset({ hex: '#000000', name: '', slug: '' });
    this.editingColor.set(null);
  }

  submitColorAdd(): void {
    if (this.colorAddForm.invalid) return;
    const { name, hex, slug } = this.colorAddForm.value;

    this.store.dispatch(
      ConfigActions.addColor({
        color: { name: name!, hex: hex!, slug: slug! },
      }),
    );
    this.showColorAddRow.set(false);
    this.colorAddForm.reset({ hex: '#000000', name: '', slug: '' });
  }

  cancelColorAdd(): void {
    this.showColorAddRow.set(false);
  }

  startEditColor(color: ColorValue): void {
    const form = new FormGroup({
      name: new FormControl(color.name, [Validators.required]),
      hex: new FormControl(color.hex, [
        Validators.required,
        Validators.pattern(/^#[0-9a-fA-F]{6}$/),
      ]),
      slug: new FormControl(color.slug, [Validators.required]),
    });

    this.editingColor.set({ oldSlug: color.slug, form });
    this.confirmDeleteColor.set(null);
    this.showColorAddRow.set(false);
  }

  submitColorEdit(): void {
    const e = this.editingColor();

    if (!e || e.form.invalid) return;

    const { name, hex, slug } = e.form.value;

    this.store.dispatch(
      ConfigActions.updateColor({
        oldSlug: e.oldSlug,
        color: { name: name!, hex: hex!, slug: slug! },
      }),
    );
    this.editingColor.set(null);
  }

  cancelColorEdit(): void {
    this.editingColor.set(null);
  }

  isEditingColor(slug: string): boolean {
    return this.editingColor()?.oldSlug === slug;
  }

  onDeleteColorClick(slug: string): void {
    this.confirmDeleteColor.set(slug);
    this.editingColor.set(null);
  }

  confirmColorDelete(): void {
    const slug = this.confirmDeleteColor();

    if (slug) this.store.dispatch(ConfigActions.removeColor({ slug }));
    this.confirmDeleteColor.set(null);
  }

  cancelColorDelete(): void {
    this.confirmDeleteColor.set(null);
  }

  // ── Simple CRUD ───────────────────────────────────────────────────
  openAdd(key: string): void {
    this.showAddRow.set(key);
    this.addControls[key]?.reset();
    this.editingSimple.set(null);
    this.confirmDeleteSimple.set(null);
  }

  submitAdd(key: string): void {
    const ctrl = this.addControls[key];

    if (!ctrl || ctrl.invalid) return;

    const value = ctrl.value.trim();

    if (value && !this.getSimpleValues(key).includes(value)) {
      this.store.dispatch(ConfigActions.addValue({ key, value }));
    }

    this.showAddRow.set(null);
    ctrl.reset();
  }

  cancelAdd(key: string): void {
    this.showAddRow.set(null);
    this.addControls[key]?.reset();
  }

  startEditSimple(key: string, value: string): void {
    this.editingSimple.set({
      key,
      oldValue: value,
      ctrl: new FormControl(value, [Validators.required]),
    });
    this.confirmDeleteSimple.set(null);
    this.showAddRow.set(null);
  }

  submitEditSimple(): void {
    const e = this.editingSimple();

    if (!e || e.ctrl.invalid) return;

    const newValue = e.ctrl.value.trim();

    if (newValue && newValue !== e.oldValue) {
      this.store.dispatch(
        ConfigActions.updateValue({
          key: e.key,
          oldValue: e.oldValue,
          newValue,
        }),
      );
    }

    this.editingSimple.set(null);
  }

  cancelEditSimple(): void {
    this.editingSimple.set(null);
  }

  isEditingSimple(key: string, value: string): boolean {
    const e = this.editingSimple();

    return e?.key === key && e?.oldValue === value;
  }

  onDeleteSimpleClick(key: string, value: string): void {
    this.confirmDeleteSimple.set({ key, value });
    this.editingSimple.set(null);
  }

  confirmSimpleDelete(): void {
    const t = this.confirmDeleteSimple();

    if (t) this.store.dispatch(ConfigActions.removeValue(t));
    this.confirmDeleteSimple.set(null);
  }

  cancelSimpleDelete(): void {
    this.confirmDeleteSimple.set(null);
  }

  isConfirmingSimpleDelete(key: string, value: string): boolean {
    const t = this.confirmDeleteSimple();

    return t?.key === key && t?.value === value;
  }
}
