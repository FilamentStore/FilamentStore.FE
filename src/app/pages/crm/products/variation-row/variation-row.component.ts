import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductVariation } from '@app/models/product.models';
import { ColorValue, SimpleAttributeOption } from '@app/models/config.models';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';
import { MediaService } from '@app/services/tempService/media.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[appVariationRow]',
  standalone: true,
  host: {
    '[class.low-stock]':
      'variation.stock_quantity > 0 && variation.stock_quantity < 5',
    '[class.out-of-stock]': 'variation.stock_quantity === 0',
    class: 'variation-row',
  },
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  templateUrl: './variation-row.component.html',
  styleUrl: './variation-row.component.scss',
})
export class VariationRowComponent implements OnInit {
  @Input({ required: true }) variation!: ProductVariation;
  @Input() skuPrefix = '';
  @Input() colorsList: ColorValue[] = [];
  @Input() simpleAttributes: Record<string, SimpleAttributeOption[]> = {
    color_type: [],
    weight: [],
    diameter: [],
    spool: [],
  };
  @Input() isSelected = false;
  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() saveVariation = new EventEmitter<{
    variationId: number;
    variation: Partial<ProductVariation>;
  }>();
  @Output() deleteVariation = new EventEmitter<number>();

  private mediaService = inject(MediaService);
  private dialog = inject(MatDialog);

  uploadingImage = signal(false);
  saving = signal(false);

  form = new FormGroup({
    regular_price: new FormControl('', [Validators.required]),
    sale_price: new FormControl(''),
    stock_quantity: new FormControl<number>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    sku: new FormControl(''),
    weight: new FormControl(''),
    status: new FormControl<'publish' | 'private'>('publish'),
  });

  ngOnInit(): void {
    this.form.patchValue({
      regular_price: this.variation.regular_price,
      sale_price: this.variation.sale_price,
      stock_quantity: this.variation.stock_quantity,
      sku: this.variation.sku,
      weight: this.variation.weight,
      status: this.variation.status,
    });
  }

  get combinationLabel(): string {
    return (
      this.variation.attributes
        .map(attribute => this.getOptionLabel(attribute.name, attribute.option))
        .join(' / ') || '—'
    );
  }

  onImageClick(): void {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (!file) return;
      this.uploadImage(file);
    };

    input.click();
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.getRawValue();

    this.saveVariation.emit({
      variationId: this.variation.id,
      variation: {
        regular_price: value.regular_price ?? '',
        sale_price: value.sale_price ?? '',
        stock_quantity: value.stock_quantity ?? 0,
        sku: value.sku || this.generateSku(),
        weight: value.weight ?? '',
        status: value.status ?? 'publish',
      },
    });

    setTimeout(() => this.saving.set(false), 300);
  }

  openDeleteDialog(): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Видалити варіацію?',
          message: `Комбінацію "${this.combinationLabel}" буде видалено назавжди.`,
          confirmLabel: 'Видалити',
          cancelLabel: 'Скасувати',
        },
        width: '380px',
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) this.deleteVariation.emit(this.variation.id);
      });
  }

  private getOptionLabel(attrName: string, option: string): string {
    const byName = this.getConfiguredOptions(attrName);
    const exact = byName.find(item => item.value === option);

    if (exact) return exact.label;

    for (const config of ATTRIBUTE_CONFIGS) {
      const match = this.getConfiguredOptions(config.label).find(
        item => item.value === option,
      );

      if (match) return match.label;
    }

    return option;
  }

  private getConfiguredOptions(
    attrName: string,
  ): { label: string; value: string }[] {
    const config = ATTRIBUTE_CONFIGS.find(item => item.label === attrName);

    if (!config) {
      return [];
    }

    if (config.type === 'color') {
      return this.colorsList.map(color => ({
        label: color.name,
        value: color.slug,
      }));
    }

    return (this.simpleAttributes[config.key] ?? []).map(option => ({
      label: option.name,
      value: option.slug,
    }));
  }

  private generateSku(): string {
    const attrPart = this.variation.attributes
      .map(attribute => attribute.option.trim())
      .filter(Boolean)
      .join('-');

    return this.slugify(
      [this.skuPrefix, attrPart].filter(Boolean).join('-') || 'variation',
    );
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0000-\u007F\p{L}\p{N}-]+/gu, '');
  }

  private uploadImage(file: File): void {
    this.uploadingImage.set(true);
    this.mediaService.uploadImage(file).subscribe({
      next: image => {
        this.uploadingImage.set(false);
        this.saveVariation.emit({
          variationId: this.variation.id,
          variation: { image },
        });
      },
      error: () => this.uploadingImage.set(false),
    });
  }
}
