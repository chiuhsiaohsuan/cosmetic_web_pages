import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService, Article } from '../../../services/admin-article';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../enviroments/enviroment';

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

  environment = environment;

  articleId!: number;

  selectedImage: File | null = null;

  article = signal<Article>({
    id: 0,
    title: '',
    description: '',
    category: '',
    date: '',
    image: ''
  });


  ngOnInit(): void {

    this.articleId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    console.log('文章 ID:', this.articleId);

    this.loadArticle();
  }


  loadArticle(): void {

    this.articleService
      .getArticle(this.articleId)
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
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // 確認是圖片
    if (!file.type.startsWith('image/')) {

      alert('請選擇圖片檔案');

      input.value = '';

      return;
    }
    this.selectedImage = file;

    // 產生圖片預覽
    this.imagePreview = URL.createObjectURL(file);

  }


  // 儲存文章
  saveArticle(): void {

    const article = this.article();

    console.log('準備更新文章:', article);

    this.articleService
      .updateArticle(
        this.articleId,
        article.title,
        article.description,
        article.category,
        article.date,
        this.selectedImage ?? undefined
      )
      .subscribe({

        next: (res) => {

          console.log('文章更新成功:', res);

          alert('文章更新成功');

          this.router.navigate(['/admin/articles']);

        },

        error: (err) => {

          console.error('文章更新失敗:', err);

          alert(
            err.error?.message ||
            '文章更新失敗，請稍後再試'
          );

        }

      });

  }


}