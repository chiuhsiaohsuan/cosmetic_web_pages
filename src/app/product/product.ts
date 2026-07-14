import { Component, computed, signal } from '@angular/core';


@Component({
  selector: 'app-product',
  templateUrl: './product.html',
  styleUrl: './product.css'
})

export class Product {


  products = [

    {
      name:'保濕精華液',
      price:980,
      image:'example.jpg',
      category:'保養品'
    },

    {
      name:'修護乳液',
      price:1280,
      image:'pic.jpg',
      category:'保養品'
    },

    {
      name:'亮白化妝水',
      price:790,
      image:'pic.jpg',
      category:'化妝水'
    },

    {
      name:'玻尿酸面膜',
      price:680,
      image:'example.jpg',
      category:'面膜'
    },

    {
      name:'卸妝油',
      price:520,
      image:'pic.jpg',
      category:'清潔用品'
    },

    {
      name:'防曬乳',
      price:880,
      image:'example.jpg',
      category:'防曬'
    },
    {
      name:'玻尿酸面膜',
      price:680,
      image:'example.jpg',
      category:'面膜'
    },

    {
      name:'卸妝油',
      price:520,
      image:'pic.jpg',
      category:'清潔用品'
    },

    {
      name:'防曬乳',
      price:880,
      image:'example.jpg',
      category:'防曬'
    }

  ];

  categories = [
    '全部',
    '保養品',
    '化妝水',
    '面膜',
    '清潔用品',
    '防曬'
  ];

  selectedCategory = signal('全部');

  filterProducts = computed(()=>{


    const category = this.selectedCategory();


    if(category === '全部'){
      return this.products;
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
  changeCategory(category:string){

    this.selectedCategory.set(category);

    this.currentPage.set(1);

  }
}