import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-member',
  imports: [CommonModule, FormsModule],
  templateUrl: './member.html',
  styleUrl: './member.css',
})
export class Member {

  user = signal({
    name: '',
    email: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  // 取得會員資料
  loadUser() {

    this.http.get(
      `${environment.apiUrl}/me`,
      {
        withCredentials: true
      }
    )
    .subscribe({

      next: (res: any) => {

        this.user.set({
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,

          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  // 修改會員資料
  updateUser() {

    const data = {
      name: this.user().name,
      email: this.user().email,
      phone: this.user().phone
    };

    this.http.put(
      `${environment.apiUrl}/user/update`,
      data,
      {
        withCredentials: true
      }
    )
    .subscribe({

      next: (res: any) => {

        alert('會員資料修改成功');

      },

      error: (err) => {

        console.log(err);

        alert(
          err.error?.message ||
          '會員資料修改失敗'
        );

      }

    });

  }

  // 修改密碼
  changePassword() {

    const oldPassword = this.user().oldPassword;
    const newPassword = this.user().newPassword;
    const confirmPassword = this.user().confirmPassword;

    // 檢查是否有輸入
    if (!oldPassword || !newPassword || !confirmPassword) {

      alert('請輸入完整密碼資料');

      return;

    }

    // 檢查新密碼與確認密碼
    if (newPassword !== confirmPassword) {

      alert('兩次輸入的新密碼不一致');

      return;

    }

    // 避免新舊密碼一樣
    if (oldPassword === newPassword) {

      alert('新密碼不能與舊密碼相同');

      return;

    }

    const data = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };

    this.http.put(
      `${environment.apiUrl}/user/password`,
      data,
      {
        withCredentials: true
      }
    )
    .subscribe({

      next: (res: any) => {

        alert('密碼修改成功');

        // 清空密碼欄位
        this.user.update(user => ({
          ...user,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

      },

      error: (err) => {

        console.log(err);

        alert(
          err.error?.message ||
          '密碼修改失敗'
        );

      }

    });

  }

}