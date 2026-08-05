import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product';
import { AdminMemberService } from '../../../services/admin-member';
import { AdminOrderService } from '../../../services/admin-order';

@Component({
  selector: 'app-admin-order-add',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-order-add.html',
  styleUrl: './admin-order-add.css'
})
export class AdminOrderAdd {
  private productService = inject(ProductService);
  private memberService = inject(AdminMemberService);
  private orderService = inject(AdminOrderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  products = signal<any[]>([]);
  users = signal<any[]>([]);
  items = signal<Array<{ product_id: number; product_name: string; quantity: number; price: number; subtotal: number }>>([]);
  loading = signal(false);
  errorMessage = signal('');

  orderForm = this.fb.group({
    user_id: [null],
    receiver_name: ['', Validators.required],
    receiver_phone: ['', Validators.required],
    receiver_email: [''],
    receiver_address: ['', Validators.required],
    selectedProductId: [null],
    selectedQuantity: [1]
  });

  ngOnInit() {
    this.loadUsers();
    this.loadProducts();
  }

  loadUsers() {
    this.memberService.getUsers().subscribe({
      next: (res) => this.users.set(res),
      error: () => this.errorMessage.set('取得會員資料失敗，請稍後再試。')
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res) => this.products.set(res),
      error: () => this.errorMessage.set('取得商品資料失敗，請稍後再試。')
    });
  }

  addItem() {
    this.errorMessage.set('');

    const productId = Number(this.orderForm.value.selectedProductId);
    const quantity = Number(this.orderForm.value.selectedQuantity);

    if (!productId || quantity <= 0) {
      this.errorMessage.set('請選擇商品並填寫正確數量。');
      return;
    }

    const product = this.products().find((item) => item.id === productId);
    if (!product) {
      this.errorMessage.set('選擇的商品不存在。');
      return;
    }

    this.items.update((current) => {
      const existing = current.find((item) => item.product_id === productId);
      if (existing) {
        existing.quantity += quantity;
        existing.subtotal = existing.quantity * existing.price;
        return [...current];
      }

      return [
        ...current,
        {
          product_id: product.id,
          product_name: product.name,
          quantity,
          price: product.price,
          subtotal: product.price * quantity
        }
      ];
    });

    this.orderForm.patchValue({ selectedProductId: null, selectedQuantity: 1 });
  }

  removeItem(index: number) {
    this.items.update((current) => current.filter((_, i) => i !== index));
  }

  orderTotal() {
    return this.items().reduce((sum, item) => sum + item.subtotal, 0);
  }

  createOrder() {
    this.errorMessage.set('');

    if (this.orderForm.invalid) {
      this.errorMessage.set('請填寫完整訂單資料。');
      return;
    }

    if (this.items().length === 0) {
      this.errorMessage.set('請至少加入一筆商品。');
      return;
    }

    const userId = Number(this.orderForm.value.user_id);
    const receiverName = String(this.orderForm.value.receiver_name).trim();
    const receiverPhone = String(this.orderForm.value.receiver_phone).trim();
    const receiverEmail = String(this.orderForm.value.receiver_email || '').trim();
    const receiverAddress = String(this.orderForm.value.receiver_address).trim();

    if (!receiverName || !receiverPhone || !receiverAddress) {
      this.errorMessage.set('請填寫完整收件人資訊。');
      return;
    }

    this.loading.set(true);

    const payload: any = {
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      receiver_email: receiverEmail || null,
      receiver_address: receiverAddress,
      items: this.items().map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    if (userId) payload.user_id = userId;

    this.orderService.createOrder(payload)
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/orders']);
        },
        error: (err) => {
          const message = err.error?.message || '新增訂單失敗，請稍後再試。';
          this.errorMessage.set(message);
          this.loading.set(false);
        }
      });
  }
}
