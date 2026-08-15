import { Component, signal, inject, computed } from '@angular/core';
import { ProductService } from '../../../services/product';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private productService = inject(ProductService);

  products = signal<any[]>([]);
  categories = signal<string[]>([]);
  searchKeyword = signal('');
  selectedCategory = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);

  readonly limit = 10;

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }
  loadCategories(): void {

    this.productService.getProductCategories()
      .subscribe({

        next: (data) => {

          this.categories.set(data);

        },

        error: (err) => {

          console.error('取得商品分類失敗:', err);

        }

      });

  }
  loadProducts(): void {

    this.productService.getAdminProducts(
      this.currentPage(),
      this.limit,
      this.searchKeyword(),
      this.selectedCategory()
    )
    .subscribe({

      next: (res) => {

        this.products.set(res.data);

        this.total.set(res.total);

        this.totalPages.set(res.totalPages);

      },

      error: (err) => {

        console.error('取得商品失敗:', err);

      }

    });

  }
  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchKeyword.set(input.value);

    // 搜尋後回第一頁
    this.currentPage.set(1);

    this.loadProducts();

  }
  onCategoryChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.selectedCategory.set(select.value);

    // 分類改變後回第一頁
    this.currentPage.set(1);

    this.loadProducts();

  }
  nextPage() {

    if (this.currentPage() < this.totalPages()) {

      this.currentPage.update(page => page + 1);

      this.loadProducts();

    }

  }

  prevPage() {

    if (this.currentPage() > 1) {

      this.currentPage.update(page => page - 1);

      this.loadProducts();

    }

  }
  deleteProduct(id: number) {

    if (!confirm("確定刪除嗎？")) return;

    this.productService
      .deleteProduct(id)
      .subscribe({

        next: () => {

          this.loadProducts();

        }

      });

  }
  toggleProductStatus(id: number) {

    this.productService.disableProduct(id).subscribe({

      next: () => {

        this.loadProducts();

      },

      error: (err) => {

        console.error('商品狀態更新失敗', err);

      }

    });

  }
}
