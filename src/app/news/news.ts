import { Component, inject, signal, computed } from '@angular/core';
import { NewsService, News as NewsData } from '../services/news';

@Component({
  selector: 'app-news',
  imports: [],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News {

  private newsService = inject(NewsService);

  newsList = signal<NewsData[]>([]);

  pageSize = signal(5);

  currentPage = signal(1);


  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {

    this.newsService.getNews().subscribe({

      next: (data) => {

        console.log('取得新聞：', data);

        this.newsList.set(data);

        this.currentPage.set(1);

      },

      error: (err) => {

        console.error('取得新聞失敗:', err);

      }

    });
  }

  pages = computed(() => {

    const totalPages = Math.ceil(
      this.newsList().length / this.pageSize()
    );

    return Array.from(
      { length: totalPages },
      (_, i) => i + 1
    );

  });

  pagedNews = computed(() => {

    const start =
      (this.currentPage() - 1) *
      this.pageSize();

    return this.newsList().slice(
      start,
      start + this.pageSize()
    );

  });

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.pages().length
    ) {
      return;
    }

    this.currentPage.set(page);

  }

}