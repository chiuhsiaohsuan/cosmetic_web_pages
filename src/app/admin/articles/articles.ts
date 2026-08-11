import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ArticleService, Article } from '../../services/admin-article';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-articles',
  imports: [DatePipe,RouterLink],
  templateUrl: './articles.html',
  styleUrl: './articles.css',
})
export class AdminArticlesComponent implements OnInit {

  private articleService = inject(ArticleService);

  articles = signal<Article[]>([]);

  ngOnInit(): void {
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