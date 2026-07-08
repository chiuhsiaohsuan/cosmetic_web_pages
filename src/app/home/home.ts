import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  slides = [
    {
      src: 'example.jpg',
      alt: 'Banner image 1',
    },
    {
      src: 'pic.jpg',
      alt: 'Banner image 2',
    },
  ];

  hotProducts = [
    {
      image: 'example.jpg',
      name: '保濕精華',
      description: '清爽保濕，適合每日保養使用。',
      price: 980,
      category: 'a',
    },
    {
      image: 'pic.jpg',
      name: '亮白乳霜',
      description: '滋潤肌膚，打造明亮柔嫩膚感。',
      price: 1280,
       category: 'b',
    },
    {
      image: 'example.jpg',
      name: '修護面膜',
      description: '密集修護，讓肌膚維持穩定光澤。',
      price: 680,
    },
  ];

  currentSlide = signal(0);
  activeCategory = signal('all');
  private autoplayId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.restartAutoplay();
  }

  selectCategory(category: string) {
    this.activeCategory.set(category);
  }

  filteredProducts() {
    if (this.activeCategory() === 'all') {
      return this.hotProducts;
    }

    return this.hotProducts.filter(
      (product) => product.category === this.activeCategory()
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
}
