import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  name = '';
  birthday = '';
  email = '';
  verificationCode = '';
  password = '';
  phone = '';
  confirmPassword = '';

  emailVerified = false;
  sendingCode = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  register() {

    // 尚未驗證 Email
    if (!this.emailVerified) {
      alert('請先完成電子郵件驗證');
      return;
    }

    // 確認密碼
    if (this.password !== this.confirmPassword) {
      alert('兩次密碼輸入不一致');
      return;
    }

    // 註冊
    this.api.register(
      this.name,
      this.birthday,
      this.password,
      this.phone,
      this.email
    ).subscribe({

      next: (res: any) => {

        console.log('註冊成功', res);

        alert('註冊成功');

        this.router.navigate(['/login']);

      },

      error: (err) => {

        console.log(err);

        alert('註冊失敗');

      }

    });
  }


  // 發送 Email 驗證碼
  sendVerificationCode() {

    if (!this.email) {
      alert('請先輸入電子郵件');
      return;
    }

    this.sendingCode = true;

    this.api.sendVerificationCode(this.email).subscribe({

      next: (result) => {

        console.log('驗證碼已寄出', result);

        alert('驗證碼已寄出，請至信箱查看');

        this.sendingCode = false;

      },

      error: (error) => {

        console.error(error);

        alert('驗證碼發送失敗');

        this.sendingCode = false;

      }

    });
  }


  // 驗證 Email
  verifyEmail() {

    if (!this.verificationCode) {
      alert('請輸入驗證碼');
      return;
    }

    this.api.verifyEmail(
      this.email,
      this.verificationCode
    ).subscribe({

      next: (result) => {

        console.log('Email 驗證成功', result);

        this.emailVerified = true;

        alert('電子郵件驗證成功');

      },

      error: (error) => {

        console.error(error);

        this.emailVerified = false;

        alert('驗證碼錯誤或已過期');

      }

    });
  }

}