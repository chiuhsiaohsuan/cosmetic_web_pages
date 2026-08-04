import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AdminOrderService } from '../../services/admin-order';
import { Order } from '../../services/order';

@Component({
  selector: 'app-admin-orders',
  imports: [DatePipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrders {
  private orderService = inject(AdminOrderService);

  orders = signal<Order[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  loading = signal(false);
  errorMessage = signal('');
  selectedOrder = signal<Order | null>(null);
  detailLoading = signal(false);
  detailError = signal('');
  showDetailModal = signal(false);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService.getOrders(this.currentPage(), 10).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('讀取訂單失敗，請稍後再試。');
        this.loading.set(false);
      }
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadOrders();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadOrders();
    }
  }

  updateStatus(order: Order, status: string) {
    if (order.order_status === status) {
      return;
    }

    this.orderService.updateStatus(order.id, status).subscribe({
      next: () => {
        this.orders.update((orders) =>
          orders.map((item) =>
            item.id === order.id ? { ...item, order_status: status } : item
          )
        );
      }
    });
  }

  updatePaymentStatus(order: Order, status: string) {
    if (order.payment_status === status) {
      return;
    }

    this.orderService.updateStatus(order.id, undefined, status).subscribe({
      next: () => {
        this.orders.update((orders) =>
          orders.map((item) =>
            item.id === order.id ? { ...item, payment_status: status } : item
          )
        );
      }
    });
  }

  showOrderDetail(order: Order) {
    this.selectedOrder.set(null);
    this.detailError.set('');
    this.detailLoading.set(true);
    this.showDetailModal.set(true);

    this.orderService.getOrder(order.id).subscribe({
      next: (detail) => {
        this.selectedOrder.set(detail);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailError.set('讀取訂單明細失敗，請稍後再試。');
        this.detailLoading.set(false);
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedOrder.set(null);
  }
}
