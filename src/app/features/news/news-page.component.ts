import { Component } from '@angular/core';
import { SiteFooterComponent } from '../../core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../core/layout/site-header/site-header.component';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [SiteHeaderComponent, SiteFooterComponent, PageHeroComponent],
  templateUrl: './news-page.component.html',
  styleUrl: './news-page.component.css',
})
export class NewsPageComponent {}
