import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogCarouselStore } from './catalog-carousel.store';

export interface CatalogItem {
  title: string;
  description: string;
  image: string;
  alt: string;
}

@Component({
  selector: 'app-catalog-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [CatalogCarouselStore],
  templateUrl: './catalog-carousel.component.html',
  styleUrl: './catalog-carousel.component.css',
})
export class CatalogCarouselComponent {
  private _items: CatalogItem[] = [];

  constructor(readonly store: CatalogCarouselStore) {}

  @Input({ required: true })
  set items(value: CatalogItem[]) {
    this._items = value;
    this.store.reset(this._items.length);
  }

  get items(): CatalogItem[] {
    return this._items;
  }

  previous(): void {
    this.store.previous(this.items.length);
  }

  next(): void {
    this.store.next(this.items.length);
  }

  activate(index: number): void {
    this.store.activate(index);
  }

  getCardClass(index: number): string {
    const activeIndex = this.store.activeIndex();
    const total = this.items.length;

    if (!total) {
      return 'is-hidden';
    }

    const distanceToRight = (index - activeIndex + total) % total;
    const distanceToLeft = (activeIndex - index + total) % total;

    if (index === activeIndex) {
      return 'is-active';
    }

    if (distanceToLeft === 1) {
      return 'is-left';
    }

    if (distanceToRight === 1) {
      return 'is-right';
    }

    return 'is-hidden';
  }
}
