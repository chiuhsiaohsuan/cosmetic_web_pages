import { Injectable, signal, computed  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

    cartItems = signal<any[]>([]);
    // 購物車商品總數量
    totalQuantity = computed(() => {

        return this.cartItems()
        .reduce((sum, item) => sum + item.quantity, 0);

    });

    // 購物車總金額
    totalPrice = computed(() => {

        return this.cartItems()
        .reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

    });
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private apiUrl = `${environment.apiUrl}/cart`;

    loadCart(user_id:number){

        this.http.get<any[]>(
        `${this.apiUrl}/${user_id}`
        )
        .subscribe(data=>{

        this.cartItems.set(data);

        });

    }


    addToCart(product:any){
    const user = this.authService.getUser();        
    this.cartItems.update(items => {

        const existItem = items.find(
            item => item.id === product.id
        );

        if(existItem){

            return items.map(item => {

                if(item.id === product.id){

                    return {
                        ...item,
                        quantity:item.quantity + product.quantity
                    };

                }

                return item;

            });

        }

        return [
            ...items,
            product
        ];

    });

    const cartData = {
        user_id: user.id, 
        product_id: product.id,
        quantity: product.quantity
    };


    return this.http.post(
        `${environment.apiUrl}/cart/add`,
        cartData
    ).subscribe({
        next: () => {
            console.log("加入成功");
        },
        error: () => {
            console.log("加入失敗");
        }
    });

}
    increaseQuantity(id:number){

        const item = this.cartItems()
            .find(item => item.id === id);


        if(item){

            const newQuantity = item.quantity + 1;


            this.updateQuantity(id,newQuantity)
            .subscribe(()=>{

                this.cartItems.update(items =>
                items.map(item =>
                    item.id === id
                    ? {...item, quantity:newQuantity}
                    : item
                )
                );

            });

        }

    }
    decreaseQuantity(id:number){

        const item = this.cartItems()
            .find(item => item.id === id);


        if(item){

            const newQuantity = item.quantity - 1;


            // 數量大於 0，更新資料庫
            if(newQuantity > 0){

            this.updateQuantity(id, newQuantity)
                .subscribe(()=>{

                this.cartItems.update(items =>
                    items.map(item =>
                    item.id === id
                    ? {...item, quantity:newQuantity}
                    : item
                    )
                );

                });

            }

            // 減到 0，移除商品
            else{

                this.removeItem(id)
                    .subscribe(()=>{

                    this.cartItems.update(items =>
                        items.filter(item => item.id !== id)
                    );

                    });

            }

        }

    }

    getCartItems() {
        return this.cartItems();
    }


    removeItem(id:number){

        return this.http.delete(
            `${environment.apiUrl}/cart/${id}`
        );

    }


    clearCart(){
        this.cartItems.set([]);
    }
    updateQuantity(id:number, quantity:number){

        return this.http.put(
            `${environment.apiUrl}/cart/update/${id}`,
            {
            quantity: quantity
            }
        );

    }
}