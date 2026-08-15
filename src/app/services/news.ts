import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface News {
  id: number;
  date: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.adminApiUrl}/news`;

  getNews(): Observable<News[]> {
    return this.http.get<News[]>(this.apiUrl);
  }

  createNews(data: {
    date: string;
    title: string;
  }): Observable<any> {

    return this.http.post(
      this.apiUrl,
      data,
      {
        withCredentials: true
      }
    );
  }

  updateNews(
    id: number,
    data: {
      date: string;
      title: string;
    }
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      data,
      {
        withCredentials: true
      }
    );
  }

  deleteNews(id: number): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );
  }
}