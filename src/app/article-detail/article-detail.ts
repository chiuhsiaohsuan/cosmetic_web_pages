import { Component, OnInit, signal, Inject } from '@angular/core';
import { DatePipe, Location, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article, ArticleService } from '../services/admin-article';
import { environment } from '../../enviroments/enviroment';
import { Meta, Title } from '@angular/platform-browser';

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
    private title: Title, 
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.setDefaultSeo();
      return;
    }

    this.articleService.getArticle(id).subscribe({
      next: (article: Article) => {
        this.article.set(article);
        this.loading.set(false);
        this.setArticleSeo( article, id );
      },
      error: (error) => { console.error( '取得文章失敗：', error ); 
        this.loading.set(false); 
        this.setDefaultSeo(); 
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
  private setArticleSeo( article: Article, id: number ): void {
    const articleTitle = this.getArticleTitle(article);
    const description = this.createDescription( article, articleTitle );
    const canonicalUrl = `https://chengyi-group.com.tw/blog/${id}`;
    this.title.setTitle( `${articleTitle}｜承檍` );
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: `${articleTitle}｜承檍` });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.setCanonical( canonicalUrl );
  }
  private setDefaultSeo(): void {
    const title = '美容保養文章｜承檍';
    const description = '閱讀承檍美容保養文章，了解肌膚管理、保養知識與美容相關資訊。';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.setCanonical( 'https://chengyi-group.com.tw/blog' );
  }
  private getArticleTitle( article: Article ): string {
    const data = article as any;
    return ( data.title || data.name || data.articleTitle || data.article_title || '美容保養文章' );
  }
  private createDescription( article: Article, articleTitle: string ): string {
    const data = article as any;
    const rawDescription = data.description || data.content || data.articleDescription || data.article_description || '';
    const description = String( rawDescription )
    if (description) { return description.slice(0, 160); } 
    return `閱讀 ${articleTitle}，了解肌膚保養、美容知識與日常肌膚管理資訊。`;
  }
  private setCanonical( url: string ): void {
    let canonicalLink = this.document.querySelector( 'link[rel="canonical"]' ) as HTMLLinkElement | null;
    if (!canonicalLink) { 
      canonicalLink = this.document.createElement( 'link' );
      canonicalLink.setAttribute( 'rel', 'canonical' ); 
      this.document.head.appendChild( canonicalLink ); 
    }
    canonicalLink.setAttribute( 'href', url ); 
  }
}
