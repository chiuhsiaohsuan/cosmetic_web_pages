import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsService, News } from '../../services/news';

@Component({
  selector: 'app-admin-news',
  imports: [FormsModule],
  templateUrl: './admin-news.html',
  styleUrl: './admin-news.css',
})
export class AdminNews {

  private newsService = inject(NewsService);

  newsList = signal<News[]>([]);

  isEditing = signal(false);

  editingId = signal<number | null>(null);

  newsDate = signal('');

  newsTitle = signal('');


  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {

    this.newsService.getNews().subscribe({

      next: (data) => {

        console.log('新聞資料：', data);

        this.newsList.set(data);

      },

      error: (err) => {

        console.error('取得新聞失敗:', err);

      }

    });
  }

  saveNews(): void {

    const date = this.newsDate();
    const title = this.newsTitle();

    if (!date || !title) {
      alert('請填寫日期與標題');
      return;
    }

    if (this.isEditing() && this.editingId() !== null) {

      this.newsService
        .updateNews(this.editingId()!, { date, title })
        .subscribe({
          next: () => {
            alert('修改成功');
            this.loadNews();
            this.resetForm();
          },
          error: (err) => {
            console.error('修改新聞失敗:', err);
            alert('修改失敗');
          }
        });

    } else {

      this.newsService
        .createNews({ date, title })
        .subscribe({
          next: () => {
            alert('新增成功');
            this.loadNews();
            this.resetForm();
          },
          error: (err) => {
            console.error('新增新聞失敗:', err);
            alert('新增失敗');
          }
        });
    }
  }

  editNews(news: News): void {

    this.isEditing.set(true);

    this.editingId.set(news.id);

    this.newsDate.set(news.date);

    this.newsTitle.set(news.title);
  }

  deleteNews(id: number): void {

    if (!confirm('確定要刪除這則新聞嗎？')) {

      return;
    }

    this.newsService
      .deleteNews(id)
      .subscribe({

        next: () => {

          alert('刪除成功');

          this.loadNews();

        },

        error: (err) => {

          console.error('刪除新聞失敗:', err);

          alert('刪除失敗');

        }

      });
  }


  resetForm(): void {

    this.isEditing.set(false);

    this.editingId.set(null);

    this.newsDate.set('');

    this.newsTitle.set('');
  }
}