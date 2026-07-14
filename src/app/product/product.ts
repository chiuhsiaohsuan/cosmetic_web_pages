import { Component } from '@angular/core';

@Component({
  selector: 'app-product',
  imports: [],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
    products = [
    {
      name: '保濕精華液',
      price: 980,
      image: 'example.jpg'
    },
    {
      name: '修護乳液',
      price: 1280,
      image: 'pic.jpg'
    },
    {
      name: '亮白化妝水',
      price: 790,
      image: 'pic.jpg'
    },
    {
      name: '玻尿酸面膜',
      price: 680,
      image: 'example.jpg'
    },
    {
      name: '卸妝油',
      price: 520,
      image: 'pic.jpg'
    },
    {
      name: '防曬乳',
      price: 880,
      image: 'example.jpg'
    }
  ];
}
