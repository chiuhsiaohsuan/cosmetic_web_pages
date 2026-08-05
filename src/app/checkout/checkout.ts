import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cartService = inject(CartService);

  receiverName = '';
  receiverPhone = '';
  receiverEmail = '';
  receiverAddress = '';

  ngOnInit() {
    const user = this.authService.getUser();

    if (user) {
      this.receiverName = user.name || '';
      this.receiverEmail = user.email || '';
      this.receiverPhone = user.phone || '';
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (userData) => {
        this.receiverName = userData.name || this.receiverName;
        this.receiverPhone = userData.phone || this.receiverPhone;
        this.receiverEmail = userData.email || this.receiverEmail;
      },
      error: () => {
        // 讀取會員資料失敗時不影響結帳流程
      }
    });
  }

  createOrder() {

    const user = this.authService.getUser();

    if (!user) {
      alert('請先登入');
      return;
    }

    if (
      !this.receiverName ||
      !this.receiverPhone ||
      !this.receiverAddress
    ) {
      alert('請填寫完整收件資料');
      return;
    }

    const orderData = {
      user_id: user.id,
      receiver_name: this.receiverName,
      receiver_phone: this.receiverPhone,
      receiver_address: this.receiverAddress,
      receiver_email: this.receiverEmail || null
    };

    this.http.post<any>(
      `${environment.apiUrl}/orders`,
      orderData
    ).subscribe({

      next: (res) => {

        console.log('訂單建立成功', res);

        // 清除前端購物車
        this.cartService.clearCart();

        // 把訂單資料帶到付款頁
        this.router.navigate([
          '/payment',
          res.order_id
        ]);

      },

      error: (err) => {

        console.error('建立訂單失敗', err);

        alert(
          err.error?.message || '建立訂單失敗'
        );

      }

    });

  }

}