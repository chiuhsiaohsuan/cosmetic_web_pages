import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product';
import { Router } from '@angular/router';


@Component({
  selector: 'app-product-add',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './product-add.html',
  styleUrl: './product-add.css'
})
export class ProductAdd {


  submitting = signal(false);


  private productService = inject(ProductService);

  private fb = inject(FormBuilder);

  private router = inject(Router);



  productForm = this.fb.group({

    name:[''],

    category:[''],

    price:[0],

    image:[''],

    description:[''],

    stock:[0],

    isHot:[0]

  });



  addProduct(){


    if(this.productForm.invalid){
      return;
    }


    this.submitting.set(true);



    this.productService
    .addProduct(
      this.productForm.value
    )
    .subscribe({

      next:(res)=>{

        alert("新增成功");

        this.router.navigate([
          "/admin/products"
        ]);

      },


      error:(err)=>{

        console.log(err);

        alert("新增失敗");

      },


      complete:()=>{

        this.submitting.set(false);

      }

    });


  }


}