import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-location',
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.css',
})
export class LocationComponent {
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {

    if (this.selectedImageIndex === null) {
      return;
    }

    switch (event.key) {

      case 'ArrowLeft':
        event.preventDefault();
        this.prevImage();
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;

      case 'Escape':
        event.preventDefault();
        this.closeImage();
        break;
    }
  }
  surroundingsImages = [
    '/surroundings/PXL_20260726_093518193.jpg',
    '/surroundings/PXL_20260726_093941885.jpg',
    '/surroundings/PXL_20260726_094047731.jpg',
    '/surroundings/PXL_20260726_095317593.jpg',
    '/surroundings/PXL_20260726_095506052.jpg',
    '/surroundings/PXL_20260726_095808960.jpg',
    '/surroundings/PXL_20260726_100209712.MP.jpg',
    '/surroundings/PXL_20260726_101450624.jpg',
    '/surroundings/PXL_20260726_101832039.jpg'
  ];

  selectedImageIndex: number | null = null;

  openImage(index: number) {
    this.selectedImageIndex = index;

    document.body.style.overflow = 'hidden';
  }

  closeImage() {
    this.selectedImageIndex = null;

    document.body.style.overflow = '';
  }

  prevImage() {
    if (this.selectedImageIndex === null) {
      return;
    }

    this.selectedImageIndex =
      this.selectedImageIndex === 0
        ? this.surroundingsImages.length - 1
        : this.selectedImageIndex - 1;
  }

  nextImage() {
    if (this.selectedImageIndex === null) {
      return;
    }

    this.selectedImageIndex =
      this.selectedImageIndex === this.surroundingsImages.length - 1
        ? 0
        : this.selectedImageIndex + 1;
  }
}
