import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product';
import { Router } from '@angular/router';
import imageCompression from 'browser-image-compression';


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

    description:[''],

    stock:[0],

    isHot:[0]

  });



  // 商品主圖
  mainImage: File | null = null;


  // 產品特色圖片
  detailImages: File[] = [];



  // 壓縮圖片
  async compressImage(file:File){

    const options = {

      maxSizeMB:0.5,

      maxWidthOrHeight:1200,

      useWebWorker:true

    };


    try{

      return await imageCompression(
        file,
        options
      );


    }catch(error){

      console.log(
        "圖片壓縮失敗",
        error
      );

      return file;

    }

  }



  // 商品主圖
  async onMainImageSelected(event:any){


    const file = event.target.files[0];


    if(!file){
      return;
    }


    console.log(
      "主圖原始大小",
      file.size / 1024 / 1024
    );


    this.mainImage =
      await this.compressImage(file);


  }



  // 產品特色圖片(多張)
  async onDetailImagesSelected(event:any){


    const files:Array<File> =
      Array.from(event.target.files);


    this.detailImages = [];


    for(const file of files){


      const compressed =
        await this.compressImage(file);


      this.detailImages.push(
        compressed
      );

    }


    console.log(
      "特色圖片數量",
      this.detailImages.length
    );


  }





  addProduct(){

    if(this.productForm.invalid){
      return;
    }


    this.submitting.set(true);

    const formData = new FormData();

    formData.append(
      "name",
      this.productForm.value.name ?? ''
    );

    formData.append(
      "category",
      this.productForm.value.category ?? ''
    );

    formData.append(
      "price",
      String(this.productForm.value.price ?? 0)
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
      String(this.productForm.value.isHot ? 1 : 0)
    );

    // 商品主圖
    if(this.mainImage){

      formData.append(
        "image",
        this.mainImage
      );

    }

    // 先新增商品
    this.productService
    .addProduct(formData)
    .subscribe({


      next:(res)=>{


        const productId = res.id;


        // 再上傳特色圖片
        if(this.detailImages.length > 0){


          this.productService
          .uploadDetailImages(
            productId,
            this.detailImages
          )
          .subscribe({

            next:()=>{

              alert("商品與特色圖片新增成功");

              this.router.navigate([
                "/admin/products"
              ]);

            },

            error:(err)=>{

              console.log(
                "特色圖片上傳失敗",
                err
              );

              alert(
                "商品成功，但特色圖片失敗"
              );

            }


          });


        }else{


          alert("新增成功");


          this.router.navigate([
            "/admin/products"
          ]);


        }


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