import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-payment',
  imports: [FormsModule, RouterLink],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // 訂單資料
  orderId = signal(0);
  totalAmount = signal(0);

  // 付款資料
  payerName = signal('');
  accountLast5 = signal('');
  amount = signal(0);

  // 付款資訊是否已送出
  submitted = signal(false);

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('orderId');

    if (!id) {
      alert('找不到訂單');
      this.router.navigate(['/cart']);
      return;
    }

    this.orderId.set(Number(id));

    this.loadOrder();
  }


  loadOrder() {

    this.http.get<any>(
      `${environment.apiUrl}/orders/${this.orderId()}`
    ).subscribe({

      next: (order) => {

        console.log('取得訂單', order);

        // 確認訂單是否可以付款
        if (order.payment_status !== '未付款') {

          alert('此訂單目前無法付款');

          this.router.navigate(['/']);

          return;
        }

        this.totalAmount.set(order.total_amount);

        this.amount.set(order.total_amount);
      },

      error: (err) => {

        console.error('取得訂單失敗', err);

        alert(
          err.error?.message || '取得訂單失敗'
        );

        this.router.navigate(['/cart']);
      }

    });

  }


  submitPayment() {

    // 取得 Signal 的值
    const payerName = this.payerName();
    const accountLast5 = this.accountLast5();
    const amount = this.amount();
    const totalAmount = this.totalAmount();
    const orderId = this.orderId();

    // 檢查資料
    if (
      !payerName ||
      !accountLast5 ||
      !amount
    ) {
      alert('請填寫完整付款資訊');
      return;
    }

    // 檢查後五碼
    if (!/^\d{5}$/.test(accountLast5)) {
      alert('匯款後五碼必須是 5 位數字');
      return;
    }

    // 檢查付款金額
    if (Number(amount) !== Number(totalAmount)) {
      alert(`匯款金額必須為 ${totalAmount} 元`);
      return;
    }

    const paymentData = {
      order_id: orderId,
      payer_name: payerName,
      account_last5: accountLast5,
      amount: Number(amount)
    };

    this.http.post<any>(
      `${environment.apiUrl}/payments`,
      paymentData
    ).subscribe({

      next: (res) => {

        console.log('付款資訊送出成功', res);

        this.submitted.set(true);
      },

      error: (err) => {

        console.error('付款資訊送出失敗', err);

        alert(
          err.error?.message || '付款資訊送出失敗'
        );

      }

    });

  }

}