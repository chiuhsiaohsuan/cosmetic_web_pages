import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';

  newPassword = '';
  confirmPassword = '';

  message = '';
  errorMessage = '';

  constructor() {

    this.token =
      this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = '重設密碼連結無效';
    }

  }

  resetPassword() {

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = '請輸入新密碼';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = '兩次輸入的密碼不一致';
      return;
    }

    this.http.post<any>(
      `${environment.apiUrl}/reset-password`,
      {
        token: this.token,
        newPassword: this.newPassword
      }
    ).subscribe({

      next: (res) => {

        this.message = res.message;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

      },

      error: (err) => {

        this.errorMessage =
          err.error?.message || '重設密碼失敗';

      }

    });

  }

}