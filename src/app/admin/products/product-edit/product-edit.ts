import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product';
import { Location } from '@angular/common';


@Component({

  selector:'app-product-edit',

  imports:[
    ReactiveFormsModule
  ],

  templateUrl:'./product-edit.html',

  styleUrl:'./product-edit.css'

})
export class ProductEdit {

  constructor(
  private location: Location
) {}

  id!:number;


  loading = signal(true);

  selectedFile?: File;

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

  onFileSelected(event:any){

    const file = event.target.files[0];

    if(file){

      this.selectedFile = file;

    }

  }
  goBack(){

  this.location.back();

}
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
    const formData = new FormData();

    formData.append(
      "name",
      this.productForm.value.name ?? ''
    );


    formData.append(
      "price",
      String(this.productForm.value.price ?? 0)
    );


    formData.append(
      "category",
      this.productForm.value.category ?? ''
    );


    formData.append(
      "description",
      this.productForm.value.description ?? ''
    );


    formData.append(
      "stock",
      String(this.productForm.value.stock ?? 0)
    );


    formData.append(
      "isHot",
      String(this.productForm.value.isHot ?? 0)
    );


    // 有選新圖片才傳
    if(this.selectedFile){

      formData.append(
        "image",
        this.selectedFile
      );

    }
    else{

      // 保留舊圖片
      formData.append(
        "oldImage",
        this.productForm.value.image ?? ''
      );

    }


    this.productService
    .updateProduct(
      this.id,
      formData
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