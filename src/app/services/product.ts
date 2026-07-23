import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';


@Injectable({
  providedIn: 'root'
})
export class ProductService {


  // 一般商品 API
  private apiUrl = `${environment.apiUrl}/products`;


  // 後台商品 API
  private adminApiUrl = `${environment.apiUrl}/admin/products`;



  constructor(
    private http: HttpClient
  ) {}

    private getHeaders(){

    const token = localStorage.getItem('token');


    return {
      headers:new HttpHeaders({

        Authorization:`Bearer ${token}`

      })
    };

  }

  // =====================
  // 前台商品
  // =====================


  // 查詢全部商品
  getProducts(){

    return this.http.get<any[]>(
      this.apiUrl
    );

  }



  // 商品詳細頁
  getProductById(id:number){

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );

  }

  // =====================
  // 後台商品管理
  // =====================



  // 後台取得全部商品
  getAdminProducts(){

    return this.http.get<any[]>(
      this.adminApiUrl,
      this.getHeaders()
    );

  }



  // 後台取得單一商品
  getProduct(id:number){

    return this.http.get<any>(
      `${this.adminApiUrl}/${id}`,
      this.getHeaders()
    );

  }

  // 新增商品

  addProduct(product:any){

    return this.http.post(
      this.adminApiUrl,
      product,
      this.getHeaders()
    );

  }


  // 修改商品

  updateProduct(
    id:number,
    product:any
  ){

    return this.http.put(
      `${this.adminApiUrl}/${id}`,
      product,
      this.getHeaders()
    );
    
  }

  // 刪除商品

  deleteProduct(id:number){

    return this.http.delete(
      `${this.adminApiUrl}/${id}`,
      this.getHeaders()
    );

  }



}