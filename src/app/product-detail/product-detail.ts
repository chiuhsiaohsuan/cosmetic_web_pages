import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart';
import { AuthService } from '../services/auth';
import { Location } from '@angular/common';
import { environment } from '../../enviroments/enviroment';


@Component({
  selector: 'app-product-detail',
  imports: [],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product = signal<any>(null);
  quantity = signal(1);
  detailImages = signal<any[]>([]);
  environment = environment;

  constructor(
    private route: ActivatedRoute,
    public productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private location: Location
  ){}
  activeTab = signal('feature');

  changeTab(tab: string) {
    this.activeTab.set(tab);
  }
  goBack() {
    this.location.back();
  }
  addCart(){
      if(!this.authService.isLogin()){

      alert("請先登入");

      return;

    }

    const item = {

      ...this.product(),

      quantity:this.quantity()

    };

    this.cartService.addToCart(item);

  }
  increase(){

    this.quantity.update(q => q + 1);

  }
  decrease(){

    this.quantity.update(q => {

      if(q > 1){
        return q - 1;
      }

      return q;
      });

  }

  ngOnInit(){
    this.route.params.subscribe(params=>{
      const id = Number(params['id']);

      this.productService
      .getProductById(id)
      .subscribe({

        next:(data)=>{

            // 存商品資料
          this.product.set(data);


            // 取得產品特色圖片
          this.productService
          .getDetailImages(data.id)
          .subscribe({

            next:(images)=>{
              
              this.detailImages.set(images);

            },

            error:(err)=>{

              console.log('取得特色圖片失敗', err);

            }

          });


        },

        error:(err)=>{
            console.log(err);

        }

      });

    });

  }

}