import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // 一般商品 API
  private apiUrl = `${environment.apiUrl}/products`;

  // 後台商品 API
  private adminApiUrl = `${environment.adminApiUrl}/products`;


  constructor(
    private http: HttpClient
  ) {}


  getImageUrl(path: string) {
    return `${environment.imageUrl}/uploads/${path}`;
  }


  getDetailImages(productId: number) {

    return this.http.get<any[]>(
      `${this.apiUrl}/${productId}/detail-images`
    );

  }

  // =====================
  // 前台商品
  // =====================
  getProducts() {

    return this.http.get<any[]>(
      this.apiUrl
    );

  }

  getProductById(id: number) {

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );

  }

  getRecommendedProducts(skinType: string) {

    return this.http.get<any[]>(
      `${this.apiUrl}/recommend`,
      {
        params: {
          skinType
        }
      }
    );

  }
  // =====================
  // 後台商品管理
  // =====================

  getAdminProducts(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    category: string = '',
    status: string = ''
  ) {

    return this.http.get<any>(
      `${this.adminApiUrl}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}`,
      {
        withCredentials: true
      }
    );

  }
  getProductSkinTypes(productId: number) {

    return this.http.get<any[]>(
      `${this.adminApiUrl}/${productId}/skin-types`,
      {
        withCredentials: true
      }
    );

  }

  getProductCategories() {

    return this.http.get<string[]>(
      `${this.adminApiUrl}/categories`,
      {
        withCredentials: true
      }
    );

  }

  getProduct(id: number) {

    return this.http.get<any>(
      `${this.adminApiUrl}/${id}`,
      {
        withCredentials: true
      }
    );

  }

  addProduct(formData: FormData) {

    return this.http.post<{
      id: number
    }>(
      `${this.adminApiUrl}`,
      formData,
      {
        withCredentials: true
      }
    );

  }

  uploadDetailImages(
    productId: number,
    images: File[]
  ) {

    const formData = new FormData();

    images.forEach((img, index) => {

      console.log(
        '送出圖片:',
        img.name,
        img.size
      );

      formData.append(
        'images',
        img,
        img.name
      );

      // 順序由預覽清單的索引決定，後端會以此寫入 sort_order。
      formData.append('sortOrders', String(index + 1));

    });

    return this.http.put(
      `${this.adminApiUrl}/${productId}/detail-images`,
      formData,
      {
        withCredentials: true
      }
    );

  }

  updateExistingDetailImages(productId: number, images: string[]) {
    return this.http.put(
      `${this.adminApiUrl}/${productId}/detail-images/order`,
      { images },
      { withCredentials: true },
    );
  }

  updateProduct(
    id: number,
    product: any
  ) {

    return this.http.put(
      `${this.adminApiUrl}/${id}`,
      product,
      {
        withCredentials: true
      }
    );

  }

  deleteProduct(id: number) {

    return this.http.delete(
      `${this.adminApiUrl}/${id}`,
      {
        withCredentials: true
      }
    );

  }

  disableProduct(id: number) {

    return this.http.put(
      `${this.adminApiUrl}/${id}/status`,
      {},
      {
        withCredentials: true
      }
    );

  }

}
