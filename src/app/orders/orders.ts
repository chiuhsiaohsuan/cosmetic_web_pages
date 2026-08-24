import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  OrderService,
  Order
} from '../services/order';


@Component({
  selector: 'app-orders',

  imports: [DatePipe, RouterLink, FormsModule],

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

  activeOrders = computed(() =>
    this.orders().filter(order =>
      !['已完成', '已取消'].includes(order.order_status)
    )
  );

  historyOrders = computed(() =>
    this.orders().filter(order =>
      ['已完成', '已取消'].includes(order.order_status)
    )
  );

  showHistory = signal(false);
  completedOrders = computed(() =>
    this.orders().filter(order =>
      order.order_status === '已完成'
    )
  );

  cancelledOrders = computed(() =>
    this.orders().filter(order =>
      order.order_status === '已取消'
    )
  );
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
  expandedOrders = signal<Set<number>>(new Set());

  toggleItems(orderId: number) {
    this.expandedOrders.update(set => {
      const newSet = new Set(set);

      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }

      return newSet;
    });
  }

  isItemsExpanded(orderId: number): boolean {
    return this.expandedOrders().has(orderId);
  }
  completeOrder(order: Order) {

      if (order.order_status !== '已出貨') {
          return;
      }

      this.orderService
          .updateStatus(order.id, '已完成')
          .subscribe({

              next: () => {

                  alert('訂單已完成');

                  this.loadOrders();

              },

              error: (err) => {

                  console.error(
                      '完成訂單失敗:',
                      err
                  );

                  alert(
                      err.error?.message ||
                      '完成訂單失敗'
                  );

              }

          });
  }
  showCancelModal = signal(false);

  selectedCancelOrder = signal<Order | null>(null);

  cancelReason = '';

  otherReason = '';
  openCancelModal(order: Order) {

    this.selectedCancelOrder.set(order);

    this.cancelReason = '';

    this.otherReason = '';

    this.showCancelModal.set(true);

  }
  closeCancelModal() {

    this.showCancelModal.set(false);

    this.selectedCancelOrder.set(null);

    this.cancelReason = '';

    this.otherReason = '';

  }
  confirmCancel() {

    if (!this.selectedCancelOrder()) {
      return;
    }

    if (!this.cancelReason) {
      return;
    }

    let reason = this.cancelReason;

    if (this.cancelReason === '其他') {

      if (!this.otherReason.trim()) {
        alert('請輸入取消原因');
        return;
      }

      reason = this.otherReason.trim();
    }

    const order = this.selectedCancelOrder();

    this.orderService
      .cancelOrder(order!.id, reason)
      .subscribe({

        next: () => {

          alert('訂單已取消');

          this.closeCancelModal();

          this.loadOrders();

        },

        error: (err) => {

          console.error(
            '取消訂單失敗',
            err
          );

          alert(
            err.error?.message ||
            '取消訂單失敗'
          );

        }

      });
  }
  openStatusModal(order: Order) {

    this.selectedOrder.set(order);

    const isPaid =
      order.payment_status === '已付款';

    const isShipped =
      order.order_status === '已出貨' ||
      order.order_status === '已完成';

    const isCompleted =
      order.order_status === '已完成';

    const isCancelled =
      order.order_status === '已取消';


    const timeline = [

      {
        title: '訂單建立',
        description: '已建立訂單',
        time: order.created_at,
        active: true
      },

      {
        title: '付款完成',
        description:
          isPaid
            ? '付款已完成'
            : '等待付款',

        time:
          isPaid
            ? order.paid_at
            : null,

        active: isPaid
      },

      {
        title: '出貨處理',

        description:
          isCancelled
            ? '未進入出貨流程'
            : isShipped
              ? '商品已出貨'
              : '等待出貨',

        time:
          isShipped
            ? order.shipped_at
            : null,

        active: isShipped
      },

      {
        title:
          isCancelled
            ? '訂單取消'
            : '訂單完成',

        description:
          isCancelled
            ? `取消原因：${order.cancel_reason ?? '未提供'}`
            : isCompleted
              ? '訂單已完成'
              : '等待完成',

        time:
          isCancelled
            ? order.cancelled_at
            : isCompleted
              ? order.completed_at
              : null,

        active:
          isCancelled ||
          isCompleted
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