import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Subscription, timer } from 'rxjs';
import { catchError, exhaustMap } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 判斷目前是否登入
  private loginStatus = new BehaviorSubject<boolean>(
    localStorage.getItem('user') !== null
  );
  loginStatus$ = this.loginStatus.asObservable();
  private sessionCheck?: Subscription;

  constructor(private http: HttpClient) {}

  // Detect account suspension even while the member leaves the browser idle.
  startSessionMonitoring() {
    if (this.sessionCheck) {
      return;
    }

    this.sessionCheck = timer(0, 5000).pipe(
      exhaustMap(() => {
        if (!this.isLogin()) {
          return EMPTY;
        }

        return this.http.get(`${environment.apiUrl}/user`).pipe(
          // The interceptor removes the credentials when the server reports a
          // suspended account. Stop this request without producing an error.
          catchError(() => EMPTY)
        );
      })
    ).subscribe();
  }

  
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
