import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService, Article } from '../../../services/admin-article';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-article-edit',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-article-edit.html',
  styleUrl: './admin-article-edit.css',
})
export class AdminArticleEditComponent {

  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private router = inject(Router);

  articleId!: number;

  article = signal<Article>({
    id: 0,
    title: '',
    description: '',
    category: '',
    date: '',
    image: ''
  });


  ngOnInit(): void {

    // 取得網址上的文章 ID
    this.articleId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    console.log('文章 ID:', this.articleId);

    // 取得文章資料
    this.loadArticle();

  }


  loadArticle(): void {

    this.articleService.getArticle(this.articleId)
      .subscribe({

        next: (data) => {

          console.log('取得文章:', data);

          this.article.set({
            ...data,
            date: data.date.split('T')[0]
          });


        },

        error: (err) => {

          console.error('取得文章失敗:', err);

          alert('找不到此文章');

          this.router.navigate(['/admin/articles']);

        }

      });

  }
  // 儲存文章
  saveArticle(): void {

    const article = this.article();

    console.log('準備更新文章:', article);

    this.articleService.updateArticle(
      this.articleId,
      {
        title: article.title,
        description: article.description,
        category: article.category,
        date: article.date,
        image: article.image
      }
    ).subscribe({

      next: (res) => {

        console.log('文章更新成功:', res);

        alert('文章更新成功');

        // 回到文章管理頁
        this.router.navigate(['/admin/articles']);

      },

      error: (err) => {

        console.error('文章更新失敗:', err);

        alert(
          err.error?.message || '文章更新失敗，請稍後再試'
        );

      }

    });

  }

}