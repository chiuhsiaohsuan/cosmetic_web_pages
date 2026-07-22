import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
      return this.http.post(`${this.apiUrl}/login`, {
          email,
          password
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

}