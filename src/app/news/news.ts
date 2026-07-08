import { Component } from '@angular/core';

@Component({
  selector: 'app-news',
  imports: [],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News {

  newsList = [
    { date: '2026-07-08', title: '新商品上市，限時優惠中' },
    { date: '2026-07-01', title: '夏季保養系列正式發售' },
    { date: '2026-06-20', title: '新商品上市，限時優惠中' },
    { date: '2026-06-18', title: '新品上市' },
    { date: '2026-06-10', title: '會員優惠活動' },
    { date: '2026-06-05', title: '父親節預購開始' },
    { date: '2026-05-28', title: '新品到貨' },
    { date: '2026-05-20', title: '夏日活動開跑' }
  ];

  pageSize = 5;
  currentPage = 1;

  get pages(): number[] {
      const totalPages = Math.ceil(this.newsList.length / this.pageSize);

      return Array.from(
          { length: totalPages },
          (_, i) => i + 1
      );
  }


  get pagedNews() {
      const start = (this.currentPage - 1) * this.pageSize;

      return this.newsList.slice(
          start,
          start + this.pageSize
      );
  }


  changePage(page: number) {

      if (page < 1 || page > this.pages.length) {
          return;
      }

      this.currentPage = page;
  }

}