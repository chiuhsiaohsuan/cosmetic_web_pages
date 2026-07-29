import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AdminMemberService {

    private apiUrl = `${environment.adminApiUrl}/users`;

    constructor(private http: HttpClient) {}

    getUsers() {
        return this.http.get<any[]>(this.apiUrl);
    }

    getUser(id:number) {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    updateStatus(id:number,status:string){

        return this.http.put(
            `${this.apiUrl}/${id}/status`,
            {
                status:status
            }
        );

    }

    deleteUser(id:number) {
        return this.http.delete(
            `${this.apiUrl}/${id}`
        );
    }

}