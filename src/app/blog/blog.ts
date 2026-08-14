import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Article, ArticleService } from '../services/admin-article';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-blog',
  imports: [DatePipe, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit {

  articles = signal<Article[]>([]);
  environment = environment;
  categories = [
    { name: '趨勢話題', value: 'trend' },
     { name: '美麗分享', value: 'share' }
  ];

  selectedCategory = signal('trend');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category },
    });

  }

  filteredArticles = computed(() => {

    const category = this.selectedCategory();

    return this.articles().filter(
      article => article.category === category
    );

  });

}
