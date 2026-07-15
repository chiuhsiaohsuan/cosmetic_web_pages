import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-product',
  templateUrl: './product.html',
  styleUrl: './product.css'
})

export class Product {
 constructor(
  private route: ActivatedRoute,
  private router: Router
) {}

  products = [

    {
      id: 1,
      name:'保濕精華液',
      price:980,
      image:'example.jpg',
      category:'care',
      isHot: true
    },

    {
      id: 2,
      name:'修護乳液',
      price:1280,
      image:'pic.jpg',
      category:'care',
      isHot: false
    },

    {
      id: 3,
      name:'亮白化妝水',
      price:790,
      image:'pic.jpg',
      category:'toner',
      isHot: true
    },

    {
      id: 4,
      name:'玻尿酸面膜',
      price:680,
      image:'example.jpg',
      category:'mask',
      isHot: true
    },

    {
      id: 5,
      name:'卸妝油',
      price:520,
      image:'pic.jpg',
      category:'clean',
      isHot: false
    },

    {
      id: 6,
      name:'防曬乳',
      price:880,
      image:'example.jpg',
      category:'sun',
      isHot: false
    },
    {
      id: 7,
      name:'玻尿酸面膜',
      price:680,
      image:'example.jpg',
      category:'mask',
      isHot: true
    },

    {
      id: 8,
      name:'卸妝油',
      price:520,
      image:'pic.jpg',
      category:'clean',
      isHot: true
    },

    {
      id: 9,
      name:'防曬乳',
      price:880,
      image:'example.jpg',
      category:'sun',
      isHot: false
    }

  ];

  categories = [
    { name: '全部', value: 'all' },
    { name: '熱銷商品', value: 'hot' },
    { name: '137時間賽道系列', value: 'care' },
    { name: 'BOCHiNG植萃沙龍-A系列', value: 'toner' },
    { name: 'BOCHiNG植萃沙龍-B系列', value: 'mask' },
    { name: 'PRINCIPESSA肌因賦活系列', value: 'clean' },
    { name: '純粹之境水精油系列', value: 'sun' }
  ];

  selectedCategory = signal('all');
  ngOnInit() {
    this.route.queryParams.subscribe(params => {

      this.selectedCategory.set(
        params['category'] ?? 'all'
      );

    });
  }
  filterProducts = computed(() => {

    const category = this.selectedCategory();

    if (category === 'all') {
      return this.products;
    }

    if (category === 'hot') {
      return this.products.filter(
        item => item.isHot
      );
    }

    return this.products.filter(
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