import { Component, inject } from '@angular/core';
import { CartService } from '../services/cart';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {


  private cartService = inject(CartService);
  private authService = inject(AuthService);

  cartItems = this.cartService.cartItems;
  totalQuantity = this.cartService.totalQuantity;
  totalPrice = this.cartService.totalPrice;

  ngOnInit(){

    const user = this.authService.getUser();

    if(user){

      this.cartService.loadCart(user.id);

    }

  }
  increase(id:number){

    this.cartService.increaseQuantity(id);

  }


  decrease(id:number){

    this.cartService.decreaseQuantity(id);

  }


  remove(id:number){

    this.cartService.removeItem(id)
      .subscribe(()=>{

        this.cartService.cartItems.update(items =>
          items.filter(item => item.id !== id)
        );

      });

  }

}