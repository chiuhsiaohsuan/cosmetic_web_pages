import { Component, OnDestroy, OnInit, signal, computed  } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ProductService } from '../services/product';

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

  products = signal<any[]>([]);
  hotProducts = computed(()=>{

  return this.products()
    .filter(product => product.isHot == 1)
    .slice(0,3);

  });
  constructor(
    private productService:ProductService
  ){}

  currentSlide = signal(0);
  activeCategory = signal('all');
  private autoplayId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.startAutoplay();
    this.productService.getProducts()
    .subscribe(products=>{
      this.products.set(products);

        
    });

  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.restartAutoplay();
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
