import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/products`;

  constructor(
    private http: HttpClient
  ) { }


  getProducts(){

    return this.http.get<any[]>(this.apiUrl);

  }
    //取得商品詳細資料
  getProductById(id:number){

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );

  }
}