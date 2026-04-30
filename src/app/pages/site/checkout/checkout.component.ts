import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';

import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';
import { NpMapModalComponent } from './np-map-modal/np-map-modal.component';
import {
  NovaPoshtaService,
  NpCity,
  NpWarehouse,
} from '@app/services/nova-poshta.service';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';
import { selectCartEntries } from '@store/cart/cart.selectors';
import { Product, ProductVariation } from '@app/models/product.models';

interface CartItem {
  product: Product;
  variation: ProductVariation;
  quantity: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BreadcrumbComponent,
    NpMapModalComponent,
  ],
  templateUrl: 'checkout.component.html',
  styleUrl: 'checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly np = inject(NovaPoshtaService);
  private readonly productsService = inject(ProductsService);
  private readonly variationsService = inject(VariationsService);

  private readonly entries = toSignal(this.store.select(selectCartEntries), {
    initialValue: [],
  });

  // ── Cart ────────────────────────────────────────────────────────────────

  readonly cartItems = signal<CartItem[]>([]);
  readonly cartLoading = signal(true);

  readonly totalPrice = computed(() =>
    this.cartItems().reduce((sum, item) => {
      const p = parseFloat(
        item.variation.sale_price && item.variation.sale_price !== '0'
          ? item.variation.sale_price
          : item.variation.regular_price,
      );

      return sum + (isNaN(p) ? 0 : p * item.quantity);
    }, 0),
  );

  readonly totalCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0),
  );

  // ── Nova Poshta ──────────────────────────────────────────────────────────

  readonly cities = signal<NpCity[]>([]);
  readonly warehouses = signal<NpWarehouse[]>([]);
  readonly citiesLoading = signal(false);
  readonly warehousesLoading = signal(false);
  readonly selectedCity = signal<NpCity | null>(null);
  readonly selectedWarehouse = signal<NpWarehouse | null>(null);
  readonly showCitiesDrop = signal(false);
  readonly showWarehousesDrop = signal(false);
  readonly showMapModal = signal(false);

  readonly filteredWarehouses = computed(() => {
    const q = (this.form.get('warehouseSearch')?.value ?? '').toLowerCase();
    const list = this.warehouses();

    if (!q) return list.slice(0, 30);

    return list
      .filter(
        w => w.Description.toLowerCase().includes(q) || w.Number.includes(q),
      )
      .slice(0, 30);
  });

  // ── Form ─────────────────────────────────────────────────────────────────

  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly contactMethod = signal<'telegram' | 'viber'>('telegram');

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    contactHandle: ['', Validators.required],
    cityQuery: [''],
    warehouseSearch: [''],
    printerCertificate: [''],
    comment: [''],
  });

  private readonly citySearch$ = new Subject<string>();

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadCartItems();
    this.setupCitySearch();
  }

  private loadCartItems(): void {
    const entries = this.entries();

    if (!entries.length) {
      this.cartLoading.set(false);

      return;
    }

    forkJoin(
      [...new Set(entries.map(e => e.productId))].map(productId =>
        forkJoin({
          product: this.productsService.getProduct(productId),
          variations: this.variationsService.getVariations(productId),
        }).pipe(
          map(({ product, variations }) =>
            entries
              .filter(e => e.productId === productId)
              .map(e => {
                const variation = variations.find(v => v.id === e.variationId);

                return variation
                  ? { product, variation, quantity: e.quantity }
                  : null;
              })
              .filter((c): c is CartItem => c !== null),
          ),
          catchError(() => of([] as CartItem[])),
        ),
      ),
    )
      .pipe(map(groups => groups.flat()))
      .subscribe({
        next: items => {
          this.cartItems.set(items);
          this.cartLoading.set(false);
        },
        error: () => this.cartLoading.set(false),
      });
  }

  private setupCitySearch(): void {
    this.citySearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          if (q.length < 2) return of([] as NpCity[]);
          this.citiesLoading.set(true);

          return this.np.searchCities(q);
        }),
      )
      .subscribe(cities => {
        this.cities.set(cities);
        this.citiesLoading.set(false);
        this.showCitiesDrop.set(cities.length > 0);
      });
  }

  // ── NP handlers ───────────────────────────────────────────────────────────

  onCityInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;

    this.selectedCity.set(null);
    this.selectedWarehouse.set(null);
    this.warehouses.set([]);
    if (q.length >= 2) {
      this.citySearch$.next(q);
    } else {
      this.cities.set([]);
      this.showCitiesDrop.set(false);
    }
  }

  selectCity(city: NpCity): void {
    this.selectedCity.set(city);
    this.selectedWarehouse.set(null);
    this.form.patchValue({ cityQuery: city.Present, warehouseSearch: '' });
    this.showCitiesDrop.set(false);
    this.cities.set([]);
    this.warehousesLoading.set(true);
    this.np.searchWarehouses(city.Ref).subscribe(list => {
      this.warehouses.set(list);
      this.warehousesLoading.set(false);
    });
  }

  onWarehouseInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;

    if (this.selectedWarehouse()) this.selectedWarehouse.set(null);
    this.showWarehousesDrop.set(q.length > 0 || this.warehouses().length > 0);
  }

  selectWarehouseFromDrop(w: NpWarehouse): void {
    this.selectedWarehouse.set(w);
    this.form.patchValue({ warehouseSearch: w.Description });
    this.showWarehousesDrop.set(false);
  }

  clearWarehouse(): void {
    this.selectedWarehouse.set(null);
    this.form.patchValue({ warehouseSearch: '' });
  }

  openMapModal(): void {
    this.showMapModal.set(true);
  }

  closeMapModal(): void {
    this.showMapModal.set(false);
  }

  onWarehouseSelected(w: NpWarehouse): void {
    this.selectedWarehouse.set(w);
    this.form.patchValue({ warehouseSearch: w.Description });
    this.showMapModal.set(false);
  }

  setContactMethod(method: 'telegram' | 'viber'): void {
    this.contactMethod.set(method);
    this.form.patchValue({ contactHandle: '' });
  }

  hideCitiesDrop(): void {
    setTimeout(() => this.showCitiesDrop.set(false), 150);
  }

  hideWarehousesDrop(): void {
    setTimeout(() => this.showWarehousesDrop.set(false), 150);
  }

  // ── Form helpers ──────────────────────────────────────────────────────────

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);

    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getItemPrice(item: CartItem): number {
    const p = parseFloat(
      item.variation.sale_price && item.variation.sale_price !== '0'
        ? item.variation.sale_price
        : item.variation.regular_price,
    );

    return isNaN(p) ? 0 : p;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  submit(): void {
    this.form.markAllAsTouched();

    const city = this.selectedCity();
    const warehouseOk = !!this.selectedWarehouse();

    if (this.form.invalid || !city || !warehouseOk) return;

    this.submitting.set(true);

    const order = {
      name: this.form.value.name,
      contactMethod: this.contactMethod(),
      contactHandle: this.form.value.contactHandle,
      city: city.Present,
      warehouse: this.selectedWarehouse()!.Description,
      printerCertificate: this.form.value.printerCertificate || null,
      comment: this.form.value.comment || null,
      items: this.cartItems().map(i => ({
        name: i.product.name,
        qty: i.quantity,
        price: this.getItemPrice(i),
      })),
      total: this.totalPrice(),
    };

    console.log('Order ready:', order);

    // TODO: надіслати на backend
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
    }, 600);
  }
}
