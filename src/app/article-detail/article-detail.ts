import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article, ArticleService } from '../services/admin-article';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-article-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {
  article = signal<Article | null>(null);
  loading = signal(true);
  environment = environment;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      return;
    }

    this.articleService.getArticle(id).subscribe({
      next: (article: Article) => {
        this.article.set(article);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goBack(): void {
    this.location.back();
  }
}
