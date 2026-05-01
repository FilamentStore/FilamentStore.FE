import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  variation_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  customer: {
    name: string;
    contact_method: 'telegram' | 'viber';
    contact_handle: string;
  };
  delivery: {
    city: string;
    warehouse: string;
  };
  items: OrderItem[];
  total: number;
  printer_certificate?: string | null;
  comment?: string | null;
}

export interface CreateOrderResponse {
  id: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  create(order: CreateOrderDto): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.baseUrl}/orders`, order);
  }
}
