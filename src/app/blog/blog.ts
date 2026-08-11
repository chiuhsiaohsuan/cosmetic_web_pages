import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Article, ArticleService } from '../services/admin-article';

@Component({
  selector: 'app-blog',
  imports: [DatePipe],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit {

  articles = signal<Article[]>([]);

  categories = [
    { name: '保養趨勢', value: 'trend' }
  ];

  selectedCategory = signal('trend');

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) {}

  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      this.selectedCategory.set(
        params['category'] ?? 'trend'
      );

    });

    // 從後端取得文章
    this.articleService.getArticles().subscribe({

      next: (data) => {
        this.articles.set(data);
      },

      error: (err) => {
        console.error('取得文章失敗:', err);
      }

    });

  }

  changeCategory(category: string) {

    this.selectedCategory.set(category);

  }

  filteredArticles = computed(() => {

    const category = this.selectedCategory();

    return this.articles().filter(
      article => article.category === category
    );

  });

}