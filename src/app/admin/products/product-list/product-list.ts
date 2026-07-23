import { Component, signal } from '@angular/core';
import { ProductService } from '../../../services/product';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  products = signal<any[]>([]);

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAdminProducts().subscribe({
      next: (res) => {
        this.products.set(res);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  deleteProduct(id: number) {

    if (!confirm("確定刪除嗎？")) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      }
    });

  }
}
