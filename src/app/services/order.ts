import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: number;
  user_name?: string;

  receiver_name: string;
  receiver_phone: string;
  receiver_email: string;
  receiver_address: string;

  total_amount: number;

  order_status: string;
  payment_status: string;

  created_at: string;
  paid_at: string | null;

  shipped_at: string | null;
  completed_at: string | null;

  cancel_reason: string | null;
  cancelled_at: string | null;

  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/orders`;

  // 取得我的訂單
  getMyOrders() {
    return this.http.get<Order[]>(
      `${this.apiUrl}/my`,
      {
        withCredentials: true
      }
    );
  }

  // 更新訂單狀態
  updateStatus(id: number, orderStatus: string) {
    return this.http.put(
      `${this.apiUrl}/${id}/status`,
      {
        order_status: orderStatus
      },
      {
        withCredentials: true
      }
    );
  }

  // 取消訂單
  cancelOrder(orderId: number, reason: string) {
    return this.http.put(
      `${this.apiUrl}/${orderId}/status`,
      {
        order_status: '已取消',
        cancel_reason: reason
      },
      {
        withCredentials: true
      }
    );
  }
}