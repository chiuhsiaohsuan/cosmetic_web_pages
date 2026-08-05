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

  selectedOrder = signal<Order | null>(null);

  showStatusModal = signal(false);

  statusTimeline = signal<{ title: string; description: string; time: string | null; active: boolean }[]>([]);


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

  completeOrder(order: Order) {
    if (order.order_status !== '已出貨') {
      return;
    }

    this.orderService.updateStatus(order.id, '已完成').subscribe({
      next: () => {
        this.orders.update((orders) =>
          orders.map((item) =>
            item.id === order.id ? { ...item, order_status: '已完成' } : item
          )
        );
        if (this.selectedOrder()?.id === order.id) {
          this.selectedOrder.update((selected) =>
            selected ? { ...selected, order_status: '已完成' } : selected
          );
        }
      },
      error: (err) => {
        console.error('完成訂單失敗:', err);
      }
    });
  }

  openStatusModal(order: Order) {
    this.selectedOrder.set(order);

    const timeline = [
      {
        title: '訂單成立',
        description: '已建立訂單',
        time: order.created_at,
        active: true
      },
      {
        title: '付款完成',
        description: order.payment_status === '已付款' ? '付款已完成' : '等待付款',
        time: order.payment_status === '已付款' ? order.paid_at : null,
        active: order.payment_status === '已付款'
      },
      {
        title: '出貨處理',
        description: order.order_status === '已出貨' ? '已出貨' : order.order_status === '已取消' ? '訂單已取消' : order.order_status === '已完成' ? '已完成' : '等待出貨',
        time: order.order_status === '已出貨' ? order.paid_at : null,
        active: order.order_status === '已出貨' || order.order_status === '已完成'
      },
      {
        title: order.order_status === '已取消' ? '訂單取消' : '訂單完成',
        description: order.order_status === '已取消' ? '訂單已取消' : order.order_status === '已完成' ? '已完成' : order.order_status === '已出貨' ? '配送中' : '等待完成',
        time: order.order_status === '已完成' ? order.paid_at : null,
        active: order.order_status === '已出貨' || order.order_status === '已取消' || order.order_status === '已完成'
      }
    ];

    this.statusTimeline.set(timeline);
    this.showStatusModal.set(true);
  }

  closeStatusModal() {
    this.showStatusModal.set(false);
    this.selectedOrder.set(null);
    this.statusTimeline.set([]);
  }

}