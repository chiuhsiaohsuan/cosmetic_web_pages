import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import imageCompression from 'browser-image-compression';
import { ProductService } from '../../../services/product';
import { environment } from '../../../../enviroments/enviroment';

interface Product {
  name?: string;
  category?: string;
  price?: number;
  image?: string;
  specification?: string;
  storage?: string;
  usage?: string;
  notice?: string;
  stock?: number;
  isHot?: number | boolean;
}

interface ProductSkinType {
  skin_type_id: number | string;
}

interface DetailImage {
  image: string;
}

const MAIN_IMAGE_OPTIONS = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
const DETAIL_IMAGE_OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 2500,
  initialQuality: 0.95,
  useWebWorker: true,
};

@Component({
  selector: 'app-product-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.css',
})
export class ProductEdit implements OnInit, OnDestroy {
  private readonly location = inject(Location);
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly environment = environment;
  readonly skinTypes = [
    { id: 1, name: '乾性' },
    { id: 2, name: '油性' },
    { id: 3, name: '敏弱' },
    { id: 4, name: '中性' },
    { id: 5, name: '混合' },
  ];
  readonly selectedSkinTypes = signal<number[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly mainImagePreview = signal<string | null>(null);
  readonly detailImagePreviews = signal<string[]>([]);

  readonly productForm = this.fb.nonNullable.group({
    name: '',
    category: '',
    price: 0,
    image: '',
    specification: '',
    storage: '',
    usage: '',
    notice: '',
    stock: 0,
    isHot: 0
  });

  id = 0;
  mainImage: File | null = null;
  detailImages: File[] = [];
  existingMainImage: string | null = null;
  existingDetailImages: string[] = [];

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.loading.set(false);
      alert('商品編號無效');
      this.goBack();
      return;
    }
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.revokePreview(this.mainImagePreview());
    this.revokePreviews(this.detailImagePreviews());
  }

  toggleSkinType(id: number): void {
    this.selectedSkinTypes.update((selected) =>
      selected.includes(id)
        ? selected.filter((skinTypeId) => skinTypeId !== id)
        : [...selected, id],
    );
  }

  isSkinTypeSelected(id: number): boolean {
    return this.selectedSkinTypes().includes(id);
  }

  async onMainImageSelected(event: Event): Promise<void> {
    const file = this.getSelectedFiles(event)[0];
    if (!file) return;
    this.revokePreview(this.mainImagePreview());
    this.mainImage = await this.compressImage(file, MAIN_IMAGE_OPTIONS);
    this.mainImagePreview.set(URL.createObjectURL(this.mainImage));
  }

  async onDetailImagesSelected(event: Event): Promise<void> {
    const files = this.getSelectedFiles(event);
    this.revokePreviews(this.detailImagePreviews());
    this.detailImages = await Promise.all(
      files.map((file) => this.compressImage(file, DETAIL_IMAGE_OPTIONS)),
    );
    this.detailImagePreviews.set(this.detailImages.map((image) => URL.createObjectURL(image)));
  }

  goBack(): void {
    this.location.back();
  }

  updateProduct(): void {
    if (this.submitting() || this.productForm.invalid) return;
    this.submitting.set(true);
    this.productService.updateProduct(this.id, this.createFormData()).subscribe({
      next: () => this.uploadDetailImages(),
      error: (error) => this.handleUpdateError(error),
    });
  }

  private loadProduct(): void {
    this.productService.getProduct(this.id).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          name: product.name ?? '',
          category: product.category ?? '',
          price: product.price ?? 0,
          image: product.image ?? '',
          specification: product.specification ?? '',
          storage: product.storage ?? '',
          usage: product.usage ?? '',
          notice: product.notice ?? '',
          stock: product.stock ?? 0,
          isHot: product.isHot ? 1 : 0,
        });
        this.existingMainImage = product.image ?? null;
        this.loading.set(false);
        this.loadProductSkinTypes();
        this.loadDetailImages();
      },
      error: () => {
        this.loading.set(false);
        alert('商品資料載入失敗');
      },
    });
  }

  private loadProductSkinTypes(): void {

    this.productService.getProductSkinTypes(this.id).subscribe({

      next: (skinTypes: ProductSkinType[]) => {

        const ids = skinTypes.map(({ skin_type_id }) =>
          Number(skin_type_id)
        );

        this.selectedSkinTypes.set(ids);

        console.log('Signal:', this.selectedSkinTypes());

      },

      error: (error) => {

        console.error('膚質載入失敗:', error);

        this.selectedSkinTypes.set([]);

      },

    });

  }

  private loadDetailImages(): void {
    this.productService.getDetailImages(this.id).subscribe({
      next: (images: DetailImage[]) => {
        this.existingDetailImages = images.map(({ image }) => image);
      },
      error: () => {
        this.existingDetailImages = [];
      },
    });
  }

  private createFormData(): FormData {
    const value = this.productForm.getRawValue();
    const formData = new FormData();
    formData.append('name', value.name);
    formData.append('category', value.category);
    formData.append('price', String(value.price));
    formData.append('skin_types', JSON.stringify(this.selectedSkinTypes()));
    formData.append('specification', value.specification);
    formData.append('storage', value.storage);
    formData.append('usage', value.usage);
    formData.append('notice', value.notice);
    formData.append('stock', String(value.stock));
    formData.append('isHot', String(value.isHot ? 1 : 0));
    if (this.mainImage) formData.append('image', this.mainImage);
    else formData.append('oldImage', value.image);
    return formData;
  }

  private uploadDetailImages(): void {
    if (this.detailImages.length === 0) {
      this.completeUpdate();
      return;
    }
    this.productService.uploadDetailImages(this.id, this.detailImages).subscribe({
      next: () => this.completeUpdate(),
      error: () => {
        this.submitting.set(false);
        alert('商品已更新，但詳細圖片上傳失敗');
      },
    });
  }

  private completeUpdate(): void {
    this.submitting.set(false);
    alert('商品更新成功');
    this.router.navigate(['/admin/products']);
  }

  private handleUpdateError(error: unknown): void {
    this.submitting.set(false);
    const message =
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
        ? error.error.message
        : '商品更新失敗';
    alert(message);
  }

  private async compressImage(
    file: File,
    options: Parameters<typeof imageCompression>[1],
  ): Promise<File> {
    try {
      const compressed = await imageCompression(file, options);
      return new File([compressed], file.name, { type: compressed.type });
    } catch {
      return file;
    }
  }

  private getSelectedFiles(event: Event): File[] {
    return Array.from((event.target as HTMLInputElement).files ?? []);
  }

  private revokePreview(url: string | null): void {
    if (url) URL.revokeObjectURL(url);
  }

  private revokePreviews(urls: string[]): void {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }
}
