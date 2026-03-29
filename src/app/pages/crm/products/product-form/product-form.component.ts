import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsActions } from '@store/products/products.actions';
import {
  selectSelectedProduct,
  selectCategories,
  selectLoading,
  selectSaving,
  selectError,
} from '@store/products/products.selectors';
import { TabBasicComponent } from './tab-basic/tab-basic.component';
import { TabAttributesComponent } from './tab-attributes/tab-attributes.component';
import { TabVariationsComponent } from './tab-variations/tab-variations.component';
import { AttributeValue, Product, ProductImage } from '@models/product.models';
import { ROUTES } from '@constants/app.routes.const';

const DEFAULT_ATTRIBUTES: AttributeValue[] = [
  { name: 'Матеріал', options: [] },
  { name: 'Колір', options: [] },
  { name: 'Вага', options: [] },
  { name: 'Діаметр', options: [] },
  { name: 'Розмір котушки', options: [] },
];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TabBasicComponent,
    TabAttributesComponent,
    TabVariationsComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  productId = signal<number | null>(null);
  isEditMode = computed(() => this.productId() !== null);

  loading = this.store.selectSignal(selectLoading);
  saving = this.store.selectSignal(selectSaving);
  categories = this.store.selectSignal(selectCategories);
  error = this.store.selectSignal(selectError);

  images = signal<ProductImage[]>([]);
  attributes = signal<AttributeValue[]>(structuredClone(DEFAULT_ATTRIBUTES));

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    brand: new FormControl('', [Validators.required]),
    category_id: new FormControl<number | null>(null, [Validators.required]),
    short_description: new FormControl(''),
    description: new FormControl(''),
    status: new FormControl<'publish' | 'draft' | 'private'>('draft'),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.store.dispatch(ProductsActions.loadCategories());

    if (id && !isNaN(Number(id))) {
      const numId = Number(id);

      this.productId.set(numId);
      this.store.dispatch(ProductsActions.loadProduct({ id: numId }));
      this.store.dispatch(ProductsActions.loadVariations({ productId: numId }));

      this.store
        .select(selectSelectedProduct)
        .pipe(
          filter((p): p is Product => p !== null && p.id === numId),
          take(1),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(product => this.patchForm(product));
    }

    this.store
      .select(selectError)
      .pipe(
        filter((e): e is string => e !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(err => {
        this.snackBar.open(`Помилка: ${err}`, 'Закрити', { duration: 5000 });
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(ProductsActions.clearSelectedProduct());
  }

  private patchForm(product: Product): void {
    this.form.patchValue({
      name: product.name,
      brand: product.brand,
      category_id: product.category_id,
      short_description: product.short_description,
      description: product.description,
      status: product.status,
    });
    this.images.set(product.images ?? []);

    if (product.attributes?.length) {
      const merged = DEFAULT_ATTRIBUTES.map(def => {
        const existing = product.attributes.find(a => a.name === def.name);

        return existing ? { name: def.name, options: existing.options } : def;
      });

      this.attributes.set(merged);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        "Будь ласка, заповніть всі обов'язкові поля",
        'Закрити',
        { duration: 3000 },
      );

      return;
    }

    const v = this.form.value;
    const productData: Partial<Product> = {
      name: v.name!,
      brand: v.brand!,
      category_id: v.category_id!,
      short_description: v.short_description ?? '',
      description: v.description ?? '',
      status: v.status ?? 'draft',
      images: this.images(),
      type: 'variable',
      attributes: this.attributes()
        .filter(a => a.options.length > 0)
        .map(a => ({
          id: 0,
          name: a.name,
          options: a.options,
          variation: true as const,
          visible: true as const,
        })),
    };

    if (this.isEditMode()) {
      this.store.dispatch(
        ProductsActions.updateProduct({
          id: this.productId()!,
          product: productData,
        }),
      );
      this.snackBar.open('Продукт збережено', '', { duration: 2500 });
    } else {
      this.store.dispatch(
        ProductsActions.createProduct({ product: productData }),
      );
    }
  }

  cancel(): void {
    this.router.navigate([`/${ROUTES.crm.root}/${ROUTES.crm.products.root}`]);
  }

  setImages = (imgs: ProductImage[]): void => {
    this.images.set(imgs);
  };

  setAttributes = (attrs: AttributeValue[]): void => {
    this.attributes.set(attrs);
  };
}
