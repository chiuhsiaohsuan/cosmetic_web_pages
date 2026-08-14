import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../services/admin-article';

@Component({
  selector: 'app-article-add',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-article-add.html',
  styleUrl: './admin-article-add.css'
})
export class AdminArticleAddComponent {

  private articleService = inject(ArticleService);
  private router = inject(Router);

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  article = {
    title: '',
    description: '',
    context:'',
    category: 'trend',
    date: '',
    image: ''
  };

  addArticle(): void {

    if (!this.selectedFile) {

      alert('請選擇文章圖片');

      return;
    }

    this.articleService.addArticle(
      this.article.title,
      this.article.description,
      this.article.context,
      this.article.category,
      this.article.date,
      this.selectedFile
    )
    .subscribe({

      next: (res) => {

        console.log('新增文章成功:', res);

        alert('文章新增成功');

        this.router.navigate(['/admin/articles']);

      },

      error: (err) => {

        console.error('新增文章失敗:', err);

        alert(
          err.error?.message || '文章新增失敗'
        );

      }

    });

  }
  onFileSelected(event: Event): void {

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

    this.selectedFile = file;

    // 直接產生圖片預覽
    this.imagePreview = URL.createObjectURL(file);
  }
}
