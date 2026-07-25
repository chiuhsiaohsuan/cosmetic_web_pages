import { Component, signal, inject } from '@angular/core';
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

  currentPage = signal(1);

  totalPages = signal(1);

  total = signal(0);

  readonly limit = 10;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {

    this.productService.getAdminProducts(
        this.currentPage(),
        this.limit
      )
      .subscribe({

        next: (res) => {

          this.products.set(res.data);

          this.total.set(res.total);

          this.totalPages.set(res.totalPages);

        }

      });

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
}
