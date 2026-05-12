import { Injectable, signal } from '@angular/core';

@Injectable()
export class CatalogCarouselStore {
  readonly activeIndex = signal(1);

  reset(length: number): void {
    this.activeIndex.set(length > 1 ? 1 : 0);
  }

  previous(length: number): void {
    if (length <= 1) {
      this.activeIndex.set(0);
      return;
    }

    this.activeIndex.update((value) => (value - 1 + length) % length);
  }

  next(length: number): void {
    if (length <= 1) {
      this.activeIndex.set(0);
      return;
    }

    this.activeIndex.update((value) => (value + 1) % length);
  }

  activate(index: number): void {
    this.activeIndex.set(index);
  }
}
