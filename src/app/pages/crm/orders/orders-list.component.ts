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

const STATUS_LABELS: Record<string, string> = {
  pending: 'Нове',
  processing: 'В обробці',
  completed: 'Виконано',
  cancelled: 'Скасовано',
};

const STATUS_CLASSES: Record<string, string> = {
  pending: 'badge--pending',
  processing: 'badge--processing',
  completed: 'badge--completed',
  cancelled: 'badge--cancelled',
};

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

  isExpanded(id: number): boolean {
    return this.expanded().has(id);
  }

  toggle(id: number): void {
    const next = new Set(this.expanded());

    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded.set(next);
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
}
