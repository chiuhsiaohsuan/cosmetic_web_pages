import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  sendResetEmail() {
    if (!this.email.trim()) {
      alert('請輸入 Email');
      return;
    }

    this.api.forgotPassword(this.email)
      .subscribe({
        next: (res: any) => {
          alert(res.message || '重設密碼信件已寄出，請檢查信箱。');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert(err.error?.message || '發送失敗，請稍後再試。');
        }
      });
  }
}
