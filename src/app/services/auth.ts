import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Subscription, timer } from 'rxjs';
import { catchError, exhaustMap } from 'rxjs/operators';
import { ApiService } from './api';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 判斷目前是否登入
  private loginStatus = new BehaviorSubject<boolean>(false);

  loginStatus$ = this.loginStatus.asObservable();

  private sessionCheck?: Subscription;

  // 暫存在記憶體中的會員資料
  private currentUser: any = null;

  constructor(private api: ApiService, private router: Router) {}


  checkLogin() {

    this.api.getMe().subscribe({
      next: (response: any) => {

        this.currentUser = response.user;

        this.loginStatus.next(true);

      },

      error: () => {

        this.currentUser = null;

        this.loginStatus.next(false);

      }
    });

  }
  // 設定目前登入的使用者
  setUser(user: any) {

    this.currentUser = user;

    this.loginStatus.next(true);

  }

  login() {

    this.api.getMe().subscribe({
      next: (response: any) => {

        this.currentUser = response.user;

        this.loginStatus.next(true);

      },

      error: () => {

        this.currentUser = null;

        this.loginStatus.next(false);

      }
    });

  }

  logout() {

    this.api.logout().subscribe({

      next: () => {

        this.currentUser = null;

        this.loginStatus.next(false);

        // 停止登入狀態監控
        this.stopSessionMonitoring();

      },

      error: () => {

        // 即使後端登出失敗
        // 前端也先視為登出

        this.currentUser = null;

        this.loginStatus.next(false);

        this.stopSessionMonitoring();

      }

    });

  }

  isLogin() {

    return this.loginStatus.value;

  }


  getUser() {

    return this.currentUser;

  }


  getUserName() {

    return this.currentUser
      ? this.currentUser.name
      : '';

  }

  startSessionMonitoring() {

    if (this.sessionCheck) {
      return;
    }

    this.sessionCheck = timer(0, 5000).pipe(

      exhaustMap(() => {

        if (!this.isLogin()) {
          return EMPTY;
        }

        return this.api.getMe().pipe(

          catchError((error) => {

            console.log('Session check:', error.status);

            if (error.status === 401 || error.status === 403) {

              this.currentUser = null;
              this.loginStatus.next(false);

              this.router.navigate(['/login']);

            }

            return EMPTY;

          })

        );

      })

    ).subscribe();

  }

  stopSessionMonitoring() {

    if (this.sessionCheck) {

      this.sessionCheck.unsubscribe();

      this.sessionCheck = undefined;

    }

  }

}