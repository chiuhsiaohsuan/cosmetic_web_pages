import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ArticleService, Article } from '../../services/admin-article';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../enviroments/enviroment';
@Component({
  selector: 'app-articles',
  imports: [DatePipe,RouterLink],
  templateUrl: './articles.html',
  styleUrl: './articles.css',
})
export class AdminArticlesComponent implements OnInit {

  private articleService = inject(ArticleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  environment = environment;

  articles = signal<Article[]>([]);
  searchKeyword = signal('');
  selectedCategory = signal('');

  filteredArticles = computed(() => {

    const keyword = this.searchKeyword()
      .trim()
      .toLowerCase();

    const category = this.selectedCategory();

    return this.articles().filter(article => {

      // 搜尋文章標題
      const matchKeyword =
        article.title.toLowerCase().includes(keyword);

      // 篩選分類
      const matchCategory =
        category === '' ||
        article.category === category;

      // 搜尋 + 分類都符合
      return matchKeyword && matchCategory;

    });

  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory.set(params['category'] ?? '');
    });

    this.getArticles();
  }

  getArticles(): void {

    this.articleService.getArticles().subscribe({
      next: (data) => {

        console.log('取得文章：', data);

        this.articles.set(data);

      },

      error: (error) => {

        console.error('取得文章失敗：', error);

      }
    });

  }
  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchKeyword.set(input.value);

  }
  onCategoryChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.selectedCategory.set(select.value);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: select.value || null },
    });

  }
  deleteArticle(id: number) {

    const article = this.articles().find(
      article => article.id === id
    );

    if (!article) {
      return;
    }

    const confirmDelete = confirm(
      `確定要刪除「${article.title}」嗎？`
    );

    if (!confirmDelete) {
      return;
    }

    this.articleService.deleteArticle(id).subscribe({

      next: () => {

        this.articles.update(articles =>
          articles.filter(article => article.id !== id)
        );

        alert('文章刪除成功');

      },

      error: (err) => {

        console.error('刪除文章失敗:', err);

        alert(
          err.error?.message || '刪除文章失敗，請稍後再試'
        );

      }

    });
  }
}
