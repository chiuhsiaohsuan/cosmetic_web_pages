import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { Order } from './order';

export type OrderStatus =
  | '待付款'
  | '已成立'
  | '已出貨'
  | '已完成'
  | '已取消';

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
      `${this.apiUrl}?page=${page}&limit=${limit}`,
      {
        withCredentials: true
      }
    );

  }


  getOrder(id: number) {

    return this.http.get<Order>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );

  }


  updateStatus(
    orderId: number,
    data: {
      order_status?: OrderStatus;
      payment_status?: string;
      cancel_reason?: string;
    }
  ) {
    return this.http.put(
      `${this.apiUrl}/${orderId}/status`,
      data,
      {
        withCredentials: true
      }
    );
  }


  createOrder(data: {
    user_id: number;
    receiver_name: string;
    receiver_phone: string;
    receiver_address: string;
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
  }) {

    return this.http.post(
      `${this.apiUrl}`,
      data,
      {
        withCredentials: true
      }
    );

  }

}