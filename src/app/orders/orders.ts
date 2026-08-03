import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  OrderService,
  Order
} from '../services/order';


@Component({
  selector: 'app-orders',

  imports: [DatePipe, RouterLink],

  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders {

  private orderService = inject(OrderService);


  orders = signal<Order[]>([]);

  loading = signal(true);

  errorMessage = signal('');


  ngOnInit() {

    this.loadOrders();

  }


  loadOrders() {

    this.loading.set(true);

    this.orderService.getMyOrders().subscribe({

      next: (data) => {

        this.orders.set(data);

        this.loading.set(false);

      },

      error: (error) => {

        console.error('取得訂單失敗:', error);

        this.errorMessage.set('無法取得訂單');

        this.loading.set(false);

      }

    });

  }

}