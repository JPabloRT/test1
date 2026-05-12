import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-hero',
  standalone: true,
  templateUrl: './page-hero.component.html',
  styleUrl: './page-hero.component.css',
})
export class PageHeroComponent {
  @Input({ required: true }) title = '';
  @Input() eyebrow = '';
  @Input() description = '';
}
