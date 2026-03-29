import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductVariation } from '@app/models/product.models';
import { MediaService } from '@app/services/tempService/media.service';
import { ProductsActions } from '@store/products/products.actions';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tr[app-variation-row]',
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
  @Input({ required: true }) productId!: number;
  @Input() isSelected = false;
  @Output() selectionChange = new EventEmitter<boolean>();

  private store = inject(Store);
  private mediaService = inject(MediaService);

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
    return this.variation.attributes.map(a => a.option).join(' / ') || '—';
  }

  onImageClick(): void {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file) return;
      this.uploadImage(file);
    };

    input.click();
  }

  private uploadImage(file: File): void {
    this.uploadingImage.set(true);
    this.mediaService.uploadImage(file).subscribe({
      next: image => {
        this.uploadingImage.set(false);
        this.store.dispatch(
          ProductsActions.updateVariation({
            productId: this.productId,
            variationId: this.variation.id,
            variation: { image },
          }),
        );
      },
      error: () => this.uploadingImage.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;

    this.store.dispatch(
      ProductsActions.updateVariation({
        productId: this.productId,
        variationId: this.variation.id,
        variation: {
          regular_price: v.regular_price ?? '',
          sale_price: v.sale_price ?? '',
          stock_quantity: v.stock_quantity ?? 0,
          sku: v.sku ?? '',
          weight: v.weight ?? '',
          status: v.status ?? 'publish',
        },
      }),
    );
    setTimeout(() => this.saving.set(false), 600);
  }
}
