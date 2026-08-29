import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AdminMemberService } from '../../services/admin-member';
import { AuthService } from '../../services/auth';
import {
  SkinAnalysisService,
  SkinAnalysisRecord
} from '../../services/skinAnalysis';


@Component({
  selector: 'app-member',

  imports: [
    DatePipe
  ],

  templateUrl: './member.html',
  styleUrl: './member.css',
})
export class AdminMemberComponent {

  users = signal<any[]>([]);

  selectedUser =
    signal<any | null>(null);

  skinAnalysisRecords =
    signal<SkinAnalysisRecord[]>([]);

  skinAnalysisLoading =
    signal(false);

  skinAnalysisError =
    signal('');


  constructor(
    private adminMemberService: AdminMemberService,
    private authService: AuthService,
    private router: Router,
    private skinAnalysisService: SkinAnalysisService
  ) {}

  ngOnInit(): void {

    this.adminMemberService
      .getUsers()
      .subscribe({

        next: data => {

          this.users.set(data);

        },

        error: error => {

          console.error(
            '取得會員資料失敗:',
            error
          );

        }

      });

  }

  showDetail(user: any): void {

    // 顯示目前會員
    this.selectedUser.set(user);


    // 清除上一位會員的檢測紀錄
    this.skinAnalysisRecords.set([]);


    // 清除錯誤訊息
    this.skinAnalysisError.set('');


    // 開始 loading
    this.skinAnalysisLoading.set(true);


    console.log(
      '查看會員:',
      user.id,
      user.name
    );

    this.skinAnalysisService
      .getUserAnalysis(user.id)
      .subscribe({

        next: records => {

          console.log(
            '會員肌膚檢測紀錄:',
            records
          );


          this.skinAnalysisRecords.set(
            records
          );


          this.skinAnalysisLoading.set(
            false
          );

        },


        error: error => {

          console.error(
            '取得肌膚檢測紀錄失敗:',
            error
          );


          this.skinAnalysisRecords.set(
            []
          );


          this.skinAnalysisLoading.set(
            false
          );


          this.skinAnalysisError.set(
            '無法取得肌膚檢測紀錄'
          );

        }

      });

  }

  closeDetail(): void {

    this.selectedUser.set(null);

    this.skinAnalysisRecords.set([]);

    this.skinAnalysisError.set('');

  }

  changeStatus(user: any): void {

    const newStatus =
      user.status === 'active'
        ? 'disabled'
        : 'active';


    this.adminMemberService
      .updateStatus(
        user.id,
        newStatus
      )
      .subscribe({

        next: () => {

          this.users.update(users =>

            users.map(item =>

              item.id === user.id
                ? {
                    ...item,
                    status: newStatus
                  }
                : item

            )

          );


          // 如果停權的是目前登入者
          const currentUser =
            this.authService.getUser();


          if (
            newStatus === 'disabled' &&
            currentUser &&
            currentUser.id === user.id
          ) {

            localStorage.removeItem('user');

            localStorage.removeItem('token');

            this.authService.logout();

            window.location.href =
              '/login';

          }

        },


        error: error => {

          console.error(
            '更新會員狀態失敗:',
            error
          );

          alert(
            '更新會員狀態失敗'
          );

        }

      });

  }

  deleteUser(user: any): void {

    const confirmDelete =
      confirm(
        `確定刪除 ${user.name} ?`
      );


    if (!confirmDelete) {
      return;
    }


    this.adminMemberService
      .deleteUser(user.id)
      .subscribe({

        next: () => {

          this.users.update(users =>

            users.filter(
              item =>
                item.id !== user.id
            )

          );

        },


        error: error => {

          console.error(
            '刪除會員失敗:',
            error
          );

          alert(
            '刪除會員失敗'
          );

        }

      });

  }

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

}