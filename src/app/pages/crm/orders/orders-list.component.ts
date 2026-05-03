import { Component, OnInit, inject, signal } from '@angular/core';
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

const TTN_RE = /^\d{14}$/;

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

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly expanded = signal<Set<number>>(new Set());
  readonly updating = signal<Set<number>>(new Set());
  readonly ttnValues = signal<Record<number, string>>({});
  readonly ttnErrors = signal<Record<number, string>>({});
  readonly cancelPending = signal<Set<number>>(new Set());
  readonly cancelReasons = signal<Record<number, string>>({});

  ngOnInit(): void {
    this.ordersService.getAll().subscribe({
      next: (res: any) => {
        const list: Order[] = Array.isArray(res)
          ? res
          : (res?.orders ?? res?.data ?? []);

        this.orders.set(list);
        this.loading.set(false);
      },
      error: err => {
        console.error('[Orders] error:', err);
        this.error.set('Не вдалося завантажити замовлення');
        this.loading.set(false);
      },
    });
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
        this.orders.update(list =>
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
        this.orders.update(list =>
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
          this.orders.update(list =>
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

  private setUpdating(id: number, on: boolean): void {
    this.updating.update(s => {
      const next = new Set(s);

      on ? next.add(id) : next.delete(id);

      return next;
    });
  }
}
