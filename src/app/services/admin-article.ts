import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Article {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.adminApiUrl}/articles`;

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }
  getArticle(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );
  }
  addArticle(
    title: string,
    description: string,
    category: string,
    date: string,
    image: File
  ) {

    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('date', date);
    formData.append('image', image);

    return this.http.post(
      this.apiUrl,
      formData
    );
  }
  updateArticle(
    id: number,
    title: string,
    description: string,
    category: string,
    date: string,
    image?: File
  ) {

    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('date', date);

    if (image) {
      formData.append('image', image);
    }

    return this.http.put(
      `${this.apiUrl}/${id}`,
      formData
    );
  }
  deleteArticle(id: number) {
  return this.http.delete(
    `${this.apiUrl}/${id}`
  );
}
}