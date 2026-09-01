import { Component, OnDestroy, OnInit, signal, computed, Inject  } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from "@angular/router";
import { ProductService } from '../services/product';
import { NewsService, News } from '../services/news';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  slides = [
    {
      src: '2026海報(1).png',
      alt: 'Banner image 1',
    },
    {
      src: '2026海報(2).png',
      alt: 'Banner image 2',
    },
    {
      src: '2026海報(3).png',
      alt: 'Banner image 3',
    },
    {
      src: '2026海報(4).png',
      alt: 'Banner image 4',
    },
    {
      src: '海鑽石KV.jpg',
      alt: 'Banner image 5',
    },
  ];
  environment = environment;
  products = signal<any[]>([]);
  latestNews = signal<News[]>([]);
  hotProducts = computed(()=>{

  return this.products()
    .filter(product => product.isHot == 1)
    .slice(0,4);

  });
  constructor(
    public productService: ProductService,
    private newsService: NewsService,
    private title: Title, 
    private meta: Meta, 
    @Inject(DOCUMENT) private document: Document
  ){}

  currentSlide = signal(0);
  activeCategory = signal('all');
  private autoplayId?: ReturnType<typeof setInterval>;
  private pointerStartX: number | null = null;
  private activePointerId: number | null = null;
  private readonly swipeThreshold = 50;

  ngOnInit() {
    this.setHomeSeo();
    this.startAutoplay();
    this.productService.getProducts()
    .subscribe(products=>{
      this.products.set(products);

        
    });

    this.newsService.getNews().subscribe({
      next: (news) => this.latestNews.set(news.slice(0, 3)),
      error: (error) => console.error('Failed to load news:', error)
    });

  }

  ngOnDestroy() {
    this.stopAutoplay();
  }
  private setHomeSeo(): void {
    const title = '承檍生技｜美妝・保養・美容';
    const description = '承檍提供智慧肌膚檢測、美容保養產品、肌膚管理與美容資訊，幫助你找到適合自己的肌膚保養方式。';
    const canonicalUrl = 'https://chengyi-group.com.tw/';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: '承檍' });
    this.setCanonical(canonicalUrl);
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
  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.restartAutoplay();
  }

  onCarouselPointerDown(event: PointerEvent) {
    if (!event.isPrimary) return;

    this.pointerStartX = event.clientX;
    this.activePointerId = event.pointerId;
    this.stopAutoplay();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onCarouselPointerUp(event: PointerEvent) {
    if (
      this.pointerStartX === null ||
      this.activePointerId !== event.pointerId
    ) return;

    const distance = event.clientX - this.pointerStartX;

    if (Math.abs(distance) >= this.swipeThreshold) {
      distance < 0 ? this.nextSlide() : this.previousSlide();
    }

    this.resetPointer();
    this.startAutoplay();
  }

  onCarouselPointerCancel() {
    this.resetPointer();
    this.startAutoplay();
  }

  private previousSlide() {
    this.currentSlide.update((index) =>
      index === 0 ? this.slides.length - 1 : index - 1
    );
  }

  private nextSlide() {
    this.currentSlide.update((index) =>
      index === this.slides.length - 1 ? 0 : index + 1
    );
  }

  private startAutoplay() {
    if (this.slides.length > 1) {
      this.autoplayId = setInterval(() => this.nextSlide(), 3500);
    }
  }

  private stopAutoplay() {
    if (this.autoplayId) {
      clearInterval(this.autoplayId);
      this.autoplayId = undefined;
    }
  }

  private restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  private resetPointer() {
    this.pointerStartX = null;
    this.activePointerId = null;
  }
}
