import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product';


@Component({

  selector:'app-product-edit',

  imports:[
    ReactiveFormsModule
  ],

  templateUrl:'./product-edit.html',

  styleUrl:'./product-edit.css'

})
export class ProductEdit {


  id!:number;


  loading = signal(true);



  private productService = inject(ProductService);

  private fb = inject(FormBuilder);

  private router = inject(Router);

  private route = inject(ActivatedRoute);



  productForm = this.fb.group({

    name:[''],

    category:[''],

    price:[0],

    image:[''],

    description:[''],

    stock:[0],

    isHot:[0]

  });



  ngOnInit(){


    this.id = Number(
      this.route.snapshot.paramMap.get('id')
    );


    this.loadProduct();


  }

  loadProduct(){


    this.productService
    .getProduct(this.id)
    .subscribe({

      next:(res)=>{


        this.productForm.patchValue(res);


        this.loading.set(false);


      },


      error:(err)=>{

        console.log(err);

        this.loading.set(false);

      }

    });


  }

  updateProduct(){


    this.productService
    .updateProduct(
      this.id,
      this.productForm.value
    )
    .subscribe({

      next:()=>{


        alert("修改成功");


        this.router.navigate([
          "/admin/products"
        ]);


      },


      error:(err)=>{

        console.log(err);

        alert("修改失敗");

      }

    });


  }


}