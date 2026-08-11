import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 判斷目前是否登入
  private loginStatus = new BehaviorSubject<boolean>(false);

  loginStatus$ = this.loginStatus.asObservable();

  // 暫存在記憶體中的會員資料
  private currentUser: any = null;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  checkLogin() {
    this.api.getMe().pipe(
      tap((response: any) => {
        this.currentUser = response.user;
        this.loginStatus.next(true);
      }),
      catchError(() => {
        this.currentUser = null;
        this.loginStatus.next(false);

        return EMPTY;
      })
    ).subscribe();
  }

  // 設定目前登入的使用者
  setUser(user: any) {
    this.currentUser = user;
    this.loginStatus.next(true);
  }

  // 登入後確認 Session
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
        this.clearLoginState();
      },

      error: () => {
        // 即使後端登出失敗
        // 前端也直接視為登出
        this.clearLoginState();
      }
    });
  }

  // 清除前端登入狀態
  clearLoginState() {
    this.currentUser = null;
    this.loginStatus.next(false);
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
}