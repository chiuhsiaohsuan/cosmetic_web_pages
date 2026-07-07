import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  slides = [
    {
      src: 'example.jpg',
      alt: 'Banner image 1',
    },
    {
      src: 'logo.png',
      alt: 'Banner image 2',
    },
  ];

  currentSlide = signal(0);

  previousSlide() {
    this.currentSlide.update((index) =>
      index === 0 ? this.slides.length - 1 : index - 1
    );
  }

  nextSlide() {
    this.currentSlide.update((index) =>
      index === this.slides.length - 1 ? 0 : index + 1
    );
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
  }
}
