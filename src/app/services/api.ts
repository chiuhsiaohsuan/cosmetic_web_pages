import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string, rememberMe: boolean) {
    return this.http.post(
      `${this.apiUrl}/login`,
      {
        email,
        password,
        rememberMe
      },
      {
        withCredentials: true
      }
    );
  }
    // 取得目前登入的使用者
    getMe() {
        return this.http.get(
        `${this.apiUrl}/me`,
        {
            withCredentials: true
        }
        );
    }
    logout() {
    return this.http.post(
        `${this.apiUrl}/logout`,
        {},
            {
                withCredentials: true
            }
        );
    }
  forgotPassword(email: string) {
      return this.http.post(`${this.apiUrl}/forgot-password`, {
          email
      });
  }
  register(
      name:string,
      birthday:string,
      password:string,
      phone:string,
      email:string
      ){

      return this.http.post(
          `${this.apiUrl}/register`,
          {
          name,
          birthday,
          password,
          phone,
          email
          }
      );
    }
    sendVerificationCode(email: string) {
        return this.http.post(
            `${this.apiUrl}/send-verification-code`,
            { email }
        );
    }

    verifyEmail(email: string, code: string) {
        return this.http.post(
            `${this.apiUrl}/verify-email`,
            {
            email,
            code
            }
        );
    }
}