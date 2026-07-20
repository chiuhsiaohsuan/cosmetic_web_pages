import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 判斷目前是否登入
  private loginStatus = new BehaviorSubject<boolean>(
    localStorage.getItem('user') !== null
  );
  loginStatus$ = this.loginStatus.asObservable();

  
  // 登入
login(token: string, user: any) {

  localStorage.setItem('token', token);

  localStorage.setItem('user', JSON.stringify(user));

  this.loginStatus.next(true);

}


  // 登出
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.loginStatus.next(false);
  }


  // 取得登入狀態
  isLogin() {

    return this.loginStatus.value;
    
  }


  // 取得會員資料
  getUser() {
    const user = localStorage.getItem('user');
    if(user){

        return JSON.parse(user);

      }

      return null;
  }
  getUserName(){

    const user = this.getUser();

    return user ? user.name : '';

  }
}