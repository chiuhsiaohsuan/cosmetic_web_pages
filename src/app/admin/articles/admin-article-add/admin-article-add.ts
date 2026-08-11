import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../../services/admin-article';

@Component({
  selector: 'app-article-add',
  imports: [FormsModule],
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

    this.selectedFile = file;

    // 圖片預覽
    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);

  }
}
