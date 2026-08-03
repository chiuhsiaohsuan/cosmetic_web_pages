import { Component, inject } from '@angular/core';
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
export class Checkout {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cartService = inject(CartService);

  receiverName = '';
  receiverPhone = '';
  receiverAddress = '';

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
      receiver_address: this.receiverAddress
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