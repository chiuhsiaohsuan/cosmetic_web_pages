import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  submitted_at: string | null;
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

  items: OrderItem[];
}


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/orders`;


  getMyOrders() {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<Order[]>(
      `${this.apiUrl}/my`,
      { headers }
    );
  }

  updateStatus(id: number, orderStatus: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/${id}/status`, {
      order_status: orderStatus
    }, { headers });
  }
}