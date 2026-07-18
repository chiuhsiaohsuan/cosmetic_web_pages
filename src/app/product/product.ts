import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.html',
  styleUrl: './product.css'
})

export class Product {
 constructor(
  private route: ActivatedRoute,
  private router: Router,
  private productService: ProductService
) {}
  goDetail(id:number){

    this.router.navigate(['/product',id]);
  }
  products = signal<any[]>([]);

  categories = [
    { name: '全部', value: 'all' },
    { name: '熱銷商品', value: 'hot' },
    { name: '137時間賽道系列', value: '137時間賽道系列' },
    { name: 'BOCHiNG植萃沙龍-A系列', value: 'BOCHiNG植萃沙龍-A系列' },
    { name: 'BOCHiNG植萃沙龍-B系列', value: 'BOCHiNG植萃沙龍-B系列' },
    { name: 'PRINCIPESSA肌因賦活系列', value: 'PRINCIPESSA肌因賦活系列' }
  ];

  selectedCategory = signal('all');
  ngOnInit() {
    this.productService.getProducts()
      .subscribe(data=>{

          this.products.set(data);

      });
    this.route.queryParams.subscribe(params => {

      this.selectedCategory.set(
        params['category'] ?? 'all'
      );

    });
  }
  filterProducts = computed(() => {

    const category = this.selectedCategory();
    const products = this.products();

    if(category === 'all'){
      return products;
    }

    if(category === 'hot'){
      return products.filter(item => item.isHot);
    }

    return products.filter(
      item => item.category === category
    );
  });


// 每頁數量
  pageSize = 6;


  //目前頁
  currentPage = signal(1);


  //總頁數
  pages = computed(()=>{


    const total = Math.ceil(
      this.filterProducts().length / this.pageSize
    );


    return Array.from(
      {length:total},
      (_,i)=>i+1
    );

  });



  //目前頁商品
  pagedProducts = computed(()=>{


    const start =
      (this.currentPage()-1) * this.pageSize;


    return this.filterProducts()
      .slice(
        start,
        start + this.pageSize
      );

  });



  //切換頁面
  changePage(page:number){

    this.currentPage.set(page);

  }



  //切換分類時回第一頁
  changeCategory(category: string){

    this.selectedCategory.set(category);

    this.currentPage.set(1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: category === 'all' ? null : category
      }
    });

  }
}