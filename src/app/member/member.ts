import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-member',
  imports: [CommonModule, FormsModule, RouterLink],
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
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  skinRecords = signal<any[]>([]);
  constructor(
    private http: HttpClient
  ) {}
  getAgeText(value: string): string {

    const map: Record<string, string> = {

      A: '25 歲以下',

      B: '26–35 歲',

      C: '36–45 歲',

      D: '46 歲以上'

    };


    return map[value] ?? value;

  }

  getFeelText(value: string): string {

    const map: Record<string, string> = {

      A: '無特別不適感',

      B: 'T 字部位出油',

      C: '容易緊繃乾燥',

      D: '全臉容易出油',

      E: '容易泛紅或刺癢'

    };


    return map[value] ?? value;

  }

  getProblemText(value: string): string {

    const map: Record<string, string> = {

      A: '乾燥缺水／粗糙',

      B: '出油／毛孔明顯',

      C: '暗沉／膚色不均',

      D: '細紋／彈性下降',

      E: '敏感泛紅／不穩定'

    };


    return map[value] ?? value;

  }

  getRoutineText(value: string): string {

    const map: Record<string, string> = {

      A: '卸妝產品',

      B: '化妝水',

      C: '乳霜',

      D: '防曬產品',

      E: '潔顏產品',

      F: '乳液',

      G: '面膜',

      H: '精華液'

    };


    return map[value] ?? value;

  }
  ngOnInit() {
    this.loadUser();
    this.loadSkinRecords();
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
  loadSkinRecords() {

  this.http.get<any[]>(
    `${environment.apiUrl}/skin-analysis`,
    {
      withCredentials: true
    }
  )
  .subscribe({

    next: (records) => {

      console.log('肌膚檢測紀錄：', records);

      this.skinRecords.set(records);

    },

    error: (err) => {

      console.error(
        '取得肌膚檢測紀錄失敗：',
        err
      );

      this.skinRecords.set([]);

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