import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { BreadcrumbComponent } from '@app/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { NpMapModalComponent } from '@pages/site/checkout/np-map-modal/np-map-modal.component';
import {
  NovaPoshtaService,
  NpCity,
  NpWarehouse,
} from '@app/services/nova-poshta.service';
import { AuthService } from '@app/services/auth/auth.service';
import { Order, OrdersService } from '@app/services/orders.service';
import { Address } from '@app/models/auth.models';
import { selectCurrentUser } from '@store/auth/auth.selectors';

const ORDERS_PER_PAGE = 5;
const PHONE_PATTERN = /^\+?[\d\s\-()]{10,15}$/;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Нове',
  'on-hold': 'Очікує оплати',
  processing: 'Оплачено',
  completed: 'Відправлено',
  cancelled: 'Скасовано',
  refunded: 'Повернення',
  failed: 'Помилка оплати',
};

const STATUS_CLASSES: Record<string, string> = {
  pending: 'account__badge--pending',
  'on-hold': 'account__badge--onhold',
  processing: 'account__badge--processing',
  completed: 'account__badge--completed',
  cancelled: 'account__badge--cancelled',
  refunded: 'account__badge--refunded',
  failed: 'account__badge--failed',
};

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    BreadcrumbComponent,
    NpMapModalComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);
  private readonly ordersService = inject(OrdersService);
  private readonly np = inject(NovaPoshtaService);
  private readonly router = inject(Router);

  // ── Profile ────────────────────────────────────────────────────────────

  readonly user = this.store.selectSignal(selectCurrentUser);
  readonly addresses = computed<Address[]>(() => this.user()?.addresses ?? []);

  readonly editingProfile = signal(false);
  readonly savingProfile = signal(false);
  readonly profileError = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.pattern(PHONE_PATTERN)]],
    telegram: [''],
    certif: [''],
  });

  // Keeps the form in sync with the store whenever we're not actively
  // editing — covers initial load, external refresh and cancel/save.
  private readonly syncProfileForm = effect(() => {
    const user = this.user();

    if (user && !this.editingProfile()) {
      this.profileForm.reset(
        {
          name: user.name,
          phone: user.phone,
          telegram: user.telegram,
          certif: user.certif,
        },
        { emitEvent: false },
      );
    }
  });

  // ── Addresses ──────────────────────────────────────────────────────────

  readonly showAddressModal = signal(false);
  readonly editingAddressId = signal<string | null>(null);
  readonly savingAddress = signal(false);
  readonly addressError = signal<string | null>(null);

  readonly addressForm = this.fb.nonNullable.group({
    cityQuery: [''],
    warehouseSearch: [''],
    isDefault: [false],
  });

  readonly pendingCity = signal('');
  readonly pendingWarehouse = signal('');

  readonly cities = signal<NpCity[]>([]);
  readonly citiesLoading = signal(false);
  readonly showCitiesDrop = signal(false);
  readonly selectedCity = signal<NpCity | null>(null);

  readonly warehouses = signal<NpWarehouse[]>([]);
  readonly warehousesLoading = signal(false);
  readonly showWarehousesDrop = signal(false);
  readonly showMapModal = signal(false);

  readonly filteredWarehouses = computed(() => {
    const q = (
      this.addressForm.controls.warehouseSearch.value ?? ''
    ).toLowerCase();
    const list = this.warehouses();

    if (!q) return list.slice(0, 30);

    return list
      .filter(
        w => w.Description.toLowerCase().includes(q) || w.Number.includes(q),
      )
      .slice(0, 30);
  });

  private readonly citySearch$ = new Subject<string>();

  // ── Orders ─────────────────────────────────────────────────────────────

  readonly orders = signal<Order[]>([]);
  readonly ordersLoading = signal(true);
  readonly ordersPage = signal(1);
  readonly ordersTotal = signal(0);
  readonly ordersTotalPages = signal(0);

  readonly ordersRangeStart = computed(() =>
    this.ordersTotal() === 0
      ? 0
      : (this.ordersPage() - 1) * ORDERS_PER_PAGE + 1,
  );
  readonly ordersRangeEnd = computed(() =>
    Math.min(this.ordersPage() * ORDERS_PER_PAGE, this.ordersTotal()),
  );

  ngOnInit(): void {
    if (!this.user()) {
      this.auth.me().subscribe();
    }

    this.setupCitySearch();
    this.loadOrders(1);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // ── Profile edit ───────────────────────────────────────────────────────

  startEditProfile(): void {
    if (!this.user()) return;

    this.profileError.set(null);
    this.editingProfile.set(true);
  }

  cancelEditProfile(): void {
    this.editingProfile.set(false);
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();

      return;
    }

    this.savingProfile.set(true);
    this.profileError.set(null);

    this.auth.updateMe(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.editingProfile.set(false);
      },
      error: () => {
        this.savingProfile.set(false);
        this.profileError.set('Не вдалося зберегти дані. Спробуйте ще раз.');
      },
    });
  }

  isProfileInvalid(field: string): boolean {
    const ctrl = this.profileForm.get(field);

    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  // ── Address modal ──────────────────────────────────────────────────────

  openAddAddress(): void {
    this.editingAddressId.set(null);
    this.addressForm.reset({
      cityQuery: '',
      warehouseSearch: '',
      isDefault: false,
    });
    this.pendingCity.set('');
    this.pendingWarehouse.set('');
    this.selectedCity.set(null);
    this.warehouses.set([]);
    this.addressError.set(null);
    this.showAddressModal.set(true);
  }

  openEditAddress(address: Address): void {
    this.editingAddressId.set(address.id);
    this.addressForm.reset({
      cityQuery: address.city,
      warehouseSearch: address.warehouse,
      isDefault: address.isDefault,
    });
    this.pendingCity.set(address.city);
    this.pendingWarehouse.set(address.warehouse);
    this.selectedCity.set(null);
    this.warehouses.set([]);
    this.addressError.set(null);
    this.showAddressModal.set(true);
  }

  closeAddressModal(): void {
    this.showAddressModal.set(false);
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

  onCityInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;

    this.selectedCity.set(null);
    if (q.length >= 2) {
      this.citySearch$.next(q);
    } else {
      this.cities.set([]);
      this.showCitiesDrop.set(false);
    }
  }

  selectCity(city: NpCity): void {
    this.selectedCity.set(city);
    this.pendingCity.set(city.Present);
    this.pendingWarehouse.set('');
    this.addressForm.patchValue({
      cityQuery: city.Present,
      warehouseSearch: '',
    });
    this.showCitiesDrop.set(false);
    this.cities.set([]);
    this.warehousesLoading.set(true);
    this.np.searchWarehouses(city.Ref).subscribe(list => {
      this.warehouses.set(list);
      this.warehousesLoading.set(false);
    });
  }

  hideCitiesDrop(): void {
    setTimeout(() => this.showCitiesDrop.set(false), 150);
  }

  onWarehouseInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;

    this.showWarehousesDrop.set(q.length > 0 || this.warehouses().length > 0);
  }

  selectWarehouse(w: NpWarehouse): void {
    this.pendingWarehouse.set(w.Description);
    this.addressForm.patchValue({ warehouseSearch: w.Description });
    this.showWarehousesDrop.set(false);
  }

  hideWarehousesDrop(): void {
    setTimeout(() => this.showWarehousesDrop.set(false), 150);
  }

  openMapModal(): void {
    if (!this.selectedCity()) return;
    this.showMapModal.set(true);
  }

  closeMapModal(): void {
    this.showMapModal.set(false);
  }

  onWarehouseSelectedFromMap(w: NpWarehouse): void {
    this.selectWarehouse(w);
    this.showMapModal.set(false);
  }

  submitAddress(): void {
    if (
      this.addressForm.invalid ||
      !this.pendingCity() ||
      !this.pendingWarehouse()
    ) {
      this.addressForm.markAllAsTouched();
      this.addressError.set(
        !this.pendingCity() || !this.pendingWarehouse()
          ? 'Оберіть місто та відділення зі списку'
          : null,
      );

      return;
    }

    const { isDefault } = this.addressForm.getRawValue();
    const editingId = this.editingAddressId();

    const newEntry: Address = {
      id: editingId ?? '',
      label: '',
      city: this.pendingCity(),
      warehouse: this.pendingWarehouse(),
      isDefault,
    };

    let updated: Address[];

    if (editingId) {
      updated = this.addresses().map(a => (a.id === editingId ? newEntry : a));
    } else {
      updated = [...this.addresses(), newEntry];
    }

    if (isDefault) {
      updated = updated.map(a =>
        a === newEntry ? a : { ...a, isDefault: false },
      );
    }

    this.savingAddress.set(true);
    this.addressError.set(null);

    this.auth.updateMe({ addresses: updated }).subscribe({
      next: () => {
        this.savingAddress.set(false);
        this.showAddressModal.set(false);
      },
      error: () => {
        this.savingAddress.set(false);
        this.addressError.set('Не вдалося зберегти адресу. Спробуйте ще раз.');
      },
    });
  }

  deleteAddress(address: Address): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Видалити адресу?',
          message: `Адреса «${address.city}, ${address.warehouse}» буде видалена.`,
          confirmLabel: 'Видалити',
          cancelLabel: 'Скасувати',
        },
        width: '380px',
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;

        const updated = this.addresses().filter(a => a.id !== address.id);

        this.auth.updateMe({ addresses: updated }).subscribe();
      });
  }

  // ── Orders ─────────────────────────────────────────────────────────────

  loadOrders(page: number): void {
    this.ordersLoading.set(true);

    this.ordersService.getMy(page, ORDERS_PER_PAGE).subscribe({
      next: res => {
        this.orders.set(res.orders);
        this.ordersTotal.set(res.total);
        this.ordersTotalPages.set(res.totalPages);
        this.ordersPage.set(page);
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false),
    });
  }

  goToOrdersPage(page: number): void {
    if (
      page < 1 ||
      page > this.ordersTotalPages() ||
      page === this.ordersPage()
    )
      return;

    this.loadOrders(page);
  }

  ordersPageNumbers(): number[] {
    return Array.from({ length: this.ordersTotalPages() }, (_, i) => i + 1);
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  statusClass(status: string): string {
    return STATUS_CLASSES[status] ?? '';
  }
}
