import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  variation_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  price: string;
  subtotal: string;
  image?: { id: number; src: string };
  attributes?: Record<string, string>;
}

export interface Order {
  id: number;
  status: string;
  created_at: string;
  total: string;
  currency: string;
  customer_name: string;
  contact_type: 'telegram' | 'viber' | 'phone';
  contact_value: string;
  city: string;
  warehouse: string;
  comment: string | null;
  certificate: string | null;
  ttn: string | null;
  cancel_reason: string | null;
  items: OrderItem[];
}

export interface CreateOrderDto {
  customer_name: string;
  contact_type: 'telegram' | 'viber' | 'phone';
  contact_value: string;
  city?: string;
  warehouse?: string;
  items: { variation_id: number; quantity: number }[];
  certificate?: string | null;
  comment?: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  create(order: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, order);
  }

  updateStatus(
    id: number,
    payload: Record<string, unknown>,
  ): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}`, payload);
  }
}
