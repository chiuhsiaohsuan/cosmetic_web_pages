import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product';
import { Location } from '@angular/common';
import imageCompression from 'browser-image-compression';


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
  submitting = signal(false);
  updateProduct() {

    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);

    const formData = new FormData();

    formData.append(
      "name",
      this.productForm.value.name ?? ""
    );

    formData.append(
      "price",
      String(this.productForm.value.price ?? 0)
    );

    formData.append(
      "category",
      this.productForm.value.category ?? ""
    );

    formData.append(
      "description",
      this.productForm.value.description ?? ""
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
    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    } else {
      // 保留舊圖片
      formData.append(
        "oldImage",
        this.productForm.value.image ?? ""
      );
    }

    this.productService
      .updateProduct(this.id, formData)
      .subscribe({

        next: () => {

          this.submitting.set(false);

          alert("修改成功");

          this.router.navigate([
            "/admin/products"
          ]);

        },

        error: (err) => {

          this.submitting.set(false);

          console.log(err);

          alert("修改失敗");

        }

      });

  }

}