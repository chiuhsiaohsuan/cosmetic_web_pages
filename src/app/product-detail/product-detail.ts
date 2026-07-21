import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart';
import { AuthService } from '../services/auth';
import { Location } from '@angular/common';


@Component({
  selector: 'app-product-detail',
  imports: [],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product = signal<any>(null);
  quantity = signal(1);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private location: Location
  ){}
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

          this.product.set(data);

        },

        error:(err)=>{
          console.log(err);
        }

      });

    });

  }

}