import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(`${this.apiUrl}/user`);
  }
    login(email: string, password: string) {
        return this.http.post(`${this.apiUrl}/login`, {
            email,
            password
        });
    }
    register(
        name:string,
        password:string,
        phone:string,
        email:string
        ){

        return this.http.post(
            `${this.apiUrl}/register`,
            {
            name,
            password,
            phone,
            email
            }
        );
        }
}