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

  selectedFile: File | null = null;
  async onFileSelected(event:any){

    const file = event.target.files[0];

    if(!file){
      return;
    }
    console.log(
      "原始大小:",
      (file.size / 1024 / 1024).toFixed(2),
      "MB"
    );

    const options = {
      maxSizeMB: 0.5,          // 最大 500KB
      maxWidthOrHeight: 1200,  // 最大寬高
      useWebWorker: true
    };

    try {

      const compressedFile =
        await imageCompression(
          file,
          options
        );

      console.log(
        "壓縮後:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      this.selectedFile = compressedFile;

    } catch(error){

      console.log(
        "圖片壓縮失敗",
        error
      );

      this.selectedFile = file;

    }

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



    if(this.selectedFile){

      formData.append(
        "image",
        this.selectedFile
      );

    }
    this.productService
    .addProduct(formData)
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