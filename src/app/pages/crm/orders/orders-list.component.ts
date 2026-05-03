import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Order, OrdersService } from '@app/services/orders.service';
import { ATTRIBUTE_CONFIGS } from '@app/constants/attribute-configs';
import { ColorValue, SimpleAttributeOption } from '@app/models/config.models';
import {
  selectAttributeColors,
  selectAttributeSimpleAttributes,
} from '@store/attributes/attributes.selectors';

interface Transition {
  label: string;
  next: string;
  kind: 'primary' | 'danger';
}

interface StatusOption {
  value: string;
  label: string;
}

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
  pending: 'badge--pending',
  'on-hold': 'badge--onhold',
  processing: 'badge--processing',
  completed: 'badge--completed',
  cancelled: 'badge--cancelled',
  refunded: 'badge--refunded',
  failed: 'badge--failed',
};

const STATUS_TRANSITIONS: Record<string, Transition[]> = {
  pending: [{ label: 'Реквізити надіслано', next: 'on-hold', kind: 'primary' }],
  'on-hold': [
    { label: 'Оплата отримана', next: 'processing', kind: 'primary' },
  ],
  processing: [],
};

const CANCELLABLE = new Set(['pending', 'on-hold', 'processing']);
const ACTIVE_STATUSES = new Set(['pending', 'on-hold', 'processing']);
const HISTORY_STATUSES = new Set([
  'completed',
  'cancelled',
  'failed',
  'refunded',
]);

const TTN_RE = /^\d{14}$/;
const PAGE_SIZE = 10;

const ACTIVE_STATUS_OPTIONS: StatusOption[] = [
  { value: '', label: 'Всі' },
  { value: 'pending', label: 'Нове' },
  { value: 'on-hold', label: 'Очікує оплати' },
  { value: 'processing', label: 'Оплачено' },
];

const HISTORY_STATUS_OPTIONS: StatusOption[] = [
  { value: '', label: 'Всі' },
  { value: 'completed', label: 'Відправлено' },
  { value: 'cancelled', label: 'Скасовано' },
  { value: 'refunded', label: 'Повернення' },
  { value: 'failed', label: 'Помилка' },
];

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly store = inject(Store);

  private readonly colors = toSignal(this.store.select(selectAttributeColors), {
    initialValue: [] as ColorValue[],
  });

  private readonly simpleAttributes = toSignal(
    this.store.select(selectAttributeSimpleAttributes),
    { initialValue: {} as Record<string, SimpleAttributeOption[]> },
  );

  readonly allOrders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly expanded = signal<Set<number>>(new Set());
  readonly updating = signal<Set<number>>(new Set());
  readonly ttnValues = signal<Record<number, string>>({});
  readonly ttnErrors = signal<Record<number, string>>({});
  readonly cancelPending = signal<Set<number>>(new Set());
  readonly cancelReasons = signal<Record<number, string>>({});

  readonly tab = signal<'active' | 'history'>('active');
  readonly statusFilter = signal('');
  readonly searchValue = signal('');
  readonly currentPage = signal(1);

  readonly statusOptions = computed(() =>
    this.tab() === 'active' ? ACTIVE_STATUS_OPTIONS : HISTORY_STATUS_OPTIONS,
  );

  readonly tabOrders = computed(() => {
    const set = this.tab() === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES;

    return this.allOrders().filter(o => set.has(o.status));
  });

  readonly filteredOrders = computed(() => {
    const q = this.searchValue().trim().toLowerCase();
    const sf = this.statusFilter();

    let list = this.tabOrders();

    if (sf) list = list.filter(o => o.status === sf);

    if (q) {
      list = list.filter(
        o =>
          o.id.toString().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.contact_value.toLowerCase().includes(q),
      );
    }

    return list;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOrders().length / PAGE_SIZE)),
  );

  readonly pagedOrders = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;

    return this.filteredOrders().slice(start, start + PAGE_SIZE);
  });

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage();

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const set = new Set([1, 2, cur - 1, cur, cur + 1, total - 1, total]);

    return [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  });

  readonly activeCount = computed(
    () => this.allOrders().filter(o => ACTIVE_STATUSES.has(o.status)).length,
  );

  readonly historyCount = computed(
    () => this.allOrders().filter(o => HISTORY_STATUSES.has(o.status)).length,
  );

  ngOnInit(): void {
    this.fetchOrders();
  }

  private fetchOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    const search = this.searchValue().trim() || undefined;

    this.ordersService.getAll({ search, per_page: 100 }).subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : (res?.orders ?? []);

        this.allOrders.set(list);
        this.loading.set(false);
      },
      error: err => {
        console.error('[Orders] error:', err);
        this.error.set('Не вдалося завантажити замовлення');
        this.loading.set(false);
      },
    });
  }

  setTab(tab: 'active' | 'history'): void {
    this.tab.set(tab);
    this.statusFilter.set('');
    this.currentPage.set(1);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;

    this.searchValue.set(val);
    this.currentPage.set(1);
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
  }

  isGap(pages: number[], i: number): boolean {
    return i > 0 && pages[i] - pages[i - 1] > 1;
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  statusClass(status: string): string {
    return STATUS_CLASSES[status] ?? '';
  }

  transitions(status: string): Transition[] {
    return STATUS_TRANSITIONS[status] ?? [];
  }

  canCancel(status: string): boolean {
    return CANCELLABLE.has(status);
  }

  isExpanded(id: number): boolean {
    return this.expanded().has(id);
  }

  toggle(id: number): void {
    const next = new Set(this.expanded());

    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded.set(next);
  }

  isUpdating(id: number): boolean {
    return this.updating().has(id);
  }

  isCancelPending(id: number): boolean {
    return this.cancelPending().has(id);
  }

  requestCancel(id: number, event: Event): void {
    event.stopPropagation();
    this.cancelPending.update(s => new Set(s).add(id));
  }

  dismissCancel(id: number): void {
    this.cancelPending.update(s => {
      const next = new Set(s);

      next.delete(id);

      return next;
    });
    this.cancelReasons.update(m => ({ ...m, [id]: '' }));
  }

  getCancelReason(id: number): string {
    return this.cancelReasons()[id] ?? '';
  }

  onCancelReasonInput(id: number, event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;

    this.cancelReasons.update(m => ({ ...m, [id]: val }));
  }

  confirmCancel(order: Order): void {
    if (this.isUpdating(order.id)) return;

    const reason = this.getCancelReason(order.id).trim();

    this.setUpdating(order.id, true);

    const payload: Record<string, unknown> = { status: 'cancelled' };

    if (reason) payload['cancel_reason'] = reason;

    this.ordersService.updateStatus(order.id, payload).subscribe({
      next: updated => {
        this.allOrders.update(list =>
          list.map(o =>
            o.id === order.id
              ? {
                  ...o,
                  status: updated.status,
                  cancel_reason: updated.cancel_reason,
                }
              : o,
          ),
        );
        this.dismissCancel(order.id);
        this.setUpdating(order.id, false);
      },
      error: () => this.setUpdating(order.id, false),
    });
  }

  getTtn(id: number): string {
    return this.ttnValues()[id] ?? '';
  }

  getTtnError(id: number): string {
    return this.ttnErrors()[id] ?? '';
  }

  onTtnInput(id: number, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const val = raw.replace(/\D/g, '').slice(0, 14);

    this.ttnValues.update(m => ({ ...m, [id]: val }));
    if (this.ttnErrors()[id]) {
      this.ttnErrors.update(m => ({ ...m, [id]: '' }));
    }
  }

  changeStatus(order: Order, toStatus: string): void {
    if (this.isUpdating(order.id)) return;

    this.setUpdating(order.id, true);
    this.ordersService.updateStatus(order.id, { status: toStatus }).subscribe({
      next: updated => {
        this.allOrders.update(list =>
          list.map(o =>
            o.id === order.id ? { ...o, status: updated.status } : o,
          ),
        );
        this.setUpdating(order.id, false);
      },
      error: () => this.setUpdating(order.id, false),
    });
  }

  ship(order: Order): void {
    if (this.isUpdating(order.id)) return;

    const ttn = this.getTtn(order.id).trim();

    if (!TTN_RE.test(ttn)) {
      this.ttnErrors.update(m => ({
        ...m,
        [order.id]: 'ТТН має містити рівно 14 цифр',
      }));

      return;
    }

    this.setUpdating(order.id, true);
    this.ordersService
      .updateStatus(order.id, { status: 'completed', ttn })
      .subscribe({
        next: updated => {
          this.allOrders.update(list =>
            list.map(o =>
              o.id === order.id
                ? { ...o, status: updated.status, ttn: updated.ttn }
                : o,
            ),
          );
          this.ttnValues.update(m => ({ ...m, [order.id]: '' }));
          this.setUpdating(order.id, false);
        },
        error: () => this.setUpdating(order.id, false),
      });
  }

  attrLabel(attrs: Record<string, string>): string {
    return Object.entries(attrs)
      .map(([attrName, slug]) => {
        const config = ATTRIBUTE_CONFIGS.find(c => c.label === attrName);

        if (!config) return `${attrName}: ${slug}`;
        const resolved =
          config.type === 'color'
            ? (this.colors().find(c => c.slug === slug)?.name ?? slug)
            : (this.simpleAttributes()[config.key]?.find(o => o.slug === slug)
                ?.name ?? slug);

        return resolved;
      })
      .join(' · ');
  }

  openChat(order: Order): void {
    const val = order.contact_value.trim();

    if (order.contact_type === 'telegram') {
      const handle = val.startsWith('@') ? val.slice(1) : val;

      window.open(`https://t.me/${handle}`, '_blank', 'noopener');

      return;
    }

    if (order.contact_type === 'viber') {
      const phone = val.replace(/\D/g, '');

      window.location.href = `viber://chat?number=%2B${phone}`;

      return;
    }

    window.location.href = `tel:${val}`;
  }

  chatTooltip(order: Order): string {
    if (order.contact_type === 'telegram') return 'Відкрити Telegram';
    if (order.contact_type === 'viber') return 'Відкрити Viber';

    return 'Зателефонувати';
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  private setUpdating(id: number, on: boolean): void {
    this.updating.update(s => {
      const next = new Set(s);

      on ? next.add(id) : next.delete(id);

      return next;
    });
  }
}
