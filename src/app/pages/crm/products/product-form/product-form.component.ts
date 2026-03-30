import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TabBasicComponent } from './tab-basic/tab-basic.component';
import { TabAttributesComponent } from './tab-attributes/tab-attributes.component';
import { TabVariationsComponent } from './tab-variations/tab-variations.component';
import {
  AttributeValue,
  Product,
  ProductImage,
  WcCategory,
} from '@models/product.models';
import {
  Brand,
  ColorValue,
  SimpleAttributeOption,
} from '@models/config.models';
import { ROUTES } from '@constants/app.routes.const';
import { ProductsService } from '@app/services/tempService/products.service';
import { BrandsService } from '@app/services/tempService/brands.service';
import { AttributesService } from '@app/services/tempService/attributes.service';

const DEFAULT_ATTRIBUTES: AttributeValue[] = [
  { name: 'Тип кольору', options: [] },
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
export class ProductFormComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private productsService = inject(ProductsService);
  private brandsService = inject(BrandsService);
  private attributesService = inject(AttributesService);

  readonly productId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.productId() !== null);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly categories = signal<WcCategory[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly colors = signal<ColorValue[]>([]);
  readonly simpleAttributes = signal<Record<string, SimpleAttributeOption[]>>({
    color_type: [],
    weight: [],
    diameter: [],
    spool: [],
  });

  readonly images = signal<ProductImage[]>([]);
  readonly attributes = signal<AttributeValue[]>(
    structuredClone(DEFAULT_ATTRIBUTES),
  );
  readonly selectedAttributes = computed(() =>
    this.attributes().filter(attribute => attribute.options.length > 0),
  );

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    brand: new FormControl('', [Validators.required]),
    category_id: new FormControl<number | null>(null, [Validators.required]),
    short_description: new FormControl(''),
    description: new FormControl(''),
    status: new FormControl<'publish' | 'draft' | 'private'>('draft'),
  });

  private readonly _formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly skuPrefix = computed(() => {
    const brand = this._formValues()?.brand ?? '';
    const catId = this._formValues()?.category_id;
    const category = this.categories().find(c => c.id === catId)?.slug ?? '';

    return [brand, category].filter(Boolean).join('-');
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.loadReferenceData();

    if (id && !isNaN(Number(id))) {
      this.productId.set(Number(id));
      this.loadProduct(this.productId()!);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.tabGroup?.realignInkBar(), 0);
    setTimeout(() => this.tabGroup?.realignInkBar(), 300);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        'Будь ласка, заповніть усі обовʼязкові поля',
        'Закрити',
        { duration: 3000 },
      );

      return;
    }

    const emptyAttributeNames = this.getEmptyAttributeNames();

    if (emptyAttributeNames.length > 0) {
      this.tabGroup.selectedIndex = 1;
      this.snackBar.open(
        `Оберіть хоча б одне значення для кожного атрибуту: ${emptyAttributeNames.join(', ')}`,
        'Закрити',
        { duration: 4500 },
      );

      return;
    }

    const value = this.form.getRawValue();
    const productData: Partial<Product> = {
      name: value.name!,
      brand: value.brand!,
      category_id: value.category_id!,
      short_description: value.short_description ?? '',
      description: value.description ?? '',
      status: value.status ?? 'draft',
      images: this.dedupeImages(this.images()),
      type: 'variable',
      attributes: this.selectedAttributes().map(attribute => ({
        id: 0,
        name: attribute.name,
        options: attribute.options,
        variation: true as const,
        visible: true as const,
      })),
    };

    this.saving.set(true);

    const request$ = this.isEditMode()
      ? this.productsService.updateProduct(this.productId()!, productData)
      : this.productsService.createProduct(productData);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: product => {
        if (this.isEditMode()) {
          this.patchForm(product);
          this.snackBar.open('Продукт збережено', '', { duration: 2500 });

          return;
        }

        this.snackBar.open('Продукт створено', '', { duration: 2500 });
        this.router.navigate([
          `/${ROUTES.crm.root}/${ROUTES.crm.products.root}/${product.id}`,
        ]);
      },
      error: error => {
        this.snackBar.open(
          `Помилка: ${error?.error?.message ?? 'не вдалося зберегти продукт'}`,
          'Закрити',
          { duration: 5000 },
        );
      },
    });
  }

  cancel(): void {
    this.router.navigate([`/${ROUTES.crm.root}/${ROUTES.crm.products.root}`]);
  }

  readonly setImages = (imgs: ProductImage[]): void => {
    this.images.set(imgs);
  };

  readonly setAttributes = (attrs: AttributeValue[]): void => {
    this.attributes.set(attrs);
  };

  private loadReferenceData(): void {
    this.productsService.getCategories().subscribe({
      next: categories => this.categories.set(categories),
      error: () => this.categories.set([]),
    });

    this.brandsService.getBrands().subscribe({
      next: brands => this.brands.set(brands),
      error: () => this.brands.set([]),
    });

    this.attributesService.loadConfig().subscribe({
      next: config => {
        this.colors.set(config.colors ?? []);
        this.simpleAttributes.set({
          color_type:
            config.simpleAttributes['color_type'] ??
            config.simpleAttributes['material'] ??
            [],
          weight: config.simpleAttributes['weight'] ?? [],
          diameter: config.simpleAttributes['diameter'] ?? [],
          spool: config.simpleAttributes['spool'] ?? [],
        });
      },
      error: () => {
        this.colors.set([]);
        this.simpleAttributes.set({
          color_type: [],
          weight: [],
          diameter: [],
          spool: [],
        });
      },
    });
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.productsService
      .getProduct(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: product => this.patchForm(product),
        error: error => {
          this.snackBar.open(
            `Помилка: ${error?.error?.message ?? 'не вдалося завантажити продукт'}`,
            'Закрити',
            { duration: 5000 },
          );
        },
      });
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
      const merged = DEFAULT_ATTRIBUTES.map(defaultAttribute => {
        const existing = product.attributes.find(
          attribute =>
            attribute.name === defaultAttribute.name ||
            (defaultAttribute.name === 'Тип кольору' &&
              attribute.name === 'Матеріал'),
        );

        return existing
          ? { name: defaultAttribute.name, options: existing.options }
          : defaultAttribute;
      });

      this.attributes.set(merged);

      return;
    }

    this.attributes.set(structuredClone(DEFAULT_ATTRIBUTES));
  }

  private dedupeImages(images: ProductImage[]): ProductImage[] {
    const unique = new Map<number, ProductImage>();

    images.forEach(image => {
      if (!unique.has(image.id)) {
        unique.set(image.id, image);
      }
    });

    return Array.from(unique.values());
  }

  private getEmptyAttributeNames(): string[] {
    return this.attributes()
      .filter(attribute => attribute.options.length === 0)
      .map(attribute => attribute.name);
  }
}
