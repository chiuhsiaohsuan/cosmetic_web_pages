import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { Order } from './order';

export interface AdminOrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private apiUrl = `${environment.adminApiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(page = 1, limit = 10) {
    return this.http.get<AdminOrderListResponse>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  getOrder(id: number) {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, orderStatus?: string, paymentStatus?: string) {
    return this.http.put(`${this.apiUrl}/${id}/status`, {
      order_status: orderStatus,
      payment_status: paymentStatus
    });
  }

  createOrder(data: {
    user_id: number;
    receiver_name: string;
    receiver_phone: string;
    receiver_address: string;
    items: Array<{ product_id: number; quantity: number }>;
  }) {
    return this.http.post(`${this.apiUrl}`, data);
  }
}
