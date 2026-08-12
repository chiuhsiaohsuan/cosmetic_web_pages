import { Component, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product';
import { Location } from '@angular/common';
import imageCompression from 'browser-image-compression';
import { environment } from '../../../../enviroments/enviroment';


@Component({

  selector:'app-product-edit',

  imports:[
    ReactiveFormsModule
  ],

  templateUrl:'./product-edit.html',

  styleUrl:'./product-edit.css'

})
export class ProductEdit implements OnDestroy{

  constructor(
  private location: Location
) {}

  id!:number;
  environment = environment;

  loading = signal(true);

  mainImage: File | null = null;
  detailImages: File[] = [];
 
  existingMainImage: string | null = null;
  existingDetailImages: string[] = [];
  mainImagePreview = signal<string | null>(null);
  detailImagePreviews = signal<string[]>([]);

  private productService = inject(ProductService);

  private fb = inject(FormBuilder);

  private router = inject(Router);

  private route = inject(ActivatedRoute);

  productForm = this.fb.group({

    name:[''],

    category:[''],

    price:[0],

    image:[''],

    specification:[''],

    storage:[''],

    usage:[''],

    notice:[''],

    stock:[0],

    isHot:[0]

  });

  async onMainImageSelected(event: any) {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }


    console.log(
      "主圖原始大小:",
      (file.size / 1024 / 1024).toFixed(2),
      "MB"
    );


    // 如果之前已經有新的預覽
    const oldPreview =
      this.mainImagePreview();

    if (oldPreview) {

      URL.revokeObjectURL(
        oldPreview
      );

    }


    const options = {

      maxSizeMB: 0.5,

      maxWidthOrHeight: 1200,

      useWebWorker: true

    };


    try {

      const compressedFile =
        await imageCompression(
          file,
          options
        );


      console.log(
        "主圖壓縮後:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB"
      );


      this.mainImage =
        compressedFile;


      // 建立新圖片預覽
      const previewUrl =
        URL.createObjectURL(
          compressedFile
        );


      this.mainImagePreview.set(
        previewUrl
      );


    } catch (error) {

      console.log(
        "圖片壓縮失敗",
        error
      );


      this.mainImage =
        file;


      // 壓縮失敗也可以預覽原圖
      const previewUrl =
        URL.createObjectURL(file);


      this.mainImagePreview.set(
        previewUrl
      );

    }

  }
  async onDetailImagesSelected(event: any) {

    const files =
      Array.from(
        event.target.files
      ) as File[];


    // 釋放上一批預覽
    this.detailImagePreviews()
      .forEach(url => {

        URL.revokeObjectURL(url);

      });


    this.detailImages = [];


    const previews: string[] = [];


    const options = {

      maxSizeMB: 1.5,

      maxWidthOrHeight: 2500,

      initialQuality: 0.95,

      useWebWorker: true

    };


    for (const file of files) {

      try {

        const compressedFile =
          await imageCompression(
            file,
            options
          );


        const newFile =
          new File(
            [compressedFile],
            file.name,
            {
              type: compressedFile.type
            }
          );


        console.log(
          "壓縮後:",
          newFile.name,
          newFile.size
        );


        this.detailImages.push(
          newFile
        );


        // 建立預覽
        const previewUrl =
          URL.createObjectURL(
            newFile
          );


        previews.push(
          previewUrl
        );


      } catch (error) {

        console.log(
          "特色圖片壓縮失敗",
          error
        );


        this.detailImages.push(
          file
        );


        // 壓縮失敗也預覽原圖
        const previewUrl =
          URL.createObjectURL(file);


        previews.push(
          previewUrl
        );

      }

    }


    this.detailImagePreviews.set(
      previews
    );


    console.log(
      "特色圖片數量:",
      this.detailImages.length
    );

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

  loadProduct() {

    // 取得商品基本資料
    this.productService
      .getProduct(this.id)
      .subscribe({

        next: (res) => {

          console.log(
            '商品資料:',
            res
          );


          // 填入表單
          this.productForm.patchValue(
            res
          );


          // 原本商品主圖
          this.existingMainImage =
            res.image ?? null;


          // 商品基本資料載入完成
          this.loading.set(false);


          // 再取得特色圖片
          this.productService
            .getDetailImages(this.id)
            .subscribe({

              next: (images) => {

                console.log(
                  '特色圖片:',
                  images
                );


                this.existingDetailImages =
                  images.map(
                    item => item.image
                  );

              },


              error: (err) => {

                console.log(
                  '取得特色圖片失敗',
                  err
                );

              }

            });

        },


        error: (err) => {

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
      "specification",
      this.productForm.value.specification ?? ""
    );

    formData.append(
      "storage",
      this.productForm.value.storage ?? ""
    );    
    formData.append(
      "usage",
      this.productForm.value.usage ?? ""
    );
    formData.append(
      "notice",
      this.productForm.value.notice ?? ""
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
    if (this.mainImage) {
      formData.append("image", this.mainImage);
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

          // 如果有新增特色圖片
            if(this.detailImages.length > 0){


                this.productService
                .uploadDetailImages(
                    this.id,
                    this.detailImages
                )
                .subscribe({

                    next:()=>{

                        this.submitting.set(false);

                        alert("修改成功");

                        this.router.navigate([
                            "/admin/products"
                        ]);

                    },


                    error:(err)=>{

                        console.log(
                            "特色圖片上傳失敗",
                            err
                        );


                        this.submitting.set(false);

                    }

                });

            }else{


                this.submitting.set(false);

                alert("修改成功");

                this.router.navigate([
                    "/admin/products"
                ]);


            }


        },

        error:(err)=>{


            this.submitting.set(false);

            console.log(err);

            alert("修改失敗");


        }


    });

  }
  ngOnDestroy(): void {

    // 釋放主圖預覽
    const mainPreview =
      this.mainImagePreview();

    if (mainPreview) {

      URL.revokeObjectURL(
        mainPreview
      );

    }


    // 釋放特色圖片預覽
    this.detailImagePreviews()
      .forEach(url => {

        URL.revokeObjectURL(url);

      });

  }
}