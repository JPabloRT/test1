import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../../core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../core/layout/site-header/site-header.component';
import {
  CatalogCarouselComponent,
  CatalogItem,
} from '../../shared/components/catalog-carousel/catalog-carousel.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [SiteHeaderComponent, SiteFooterComponent, RouterLink, CatalogCarouselComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  readonly catalogItems: CatalogItem[] = [
    {
      title: 'Eléctricos',
      description:
        'Certificación para garantizar seguridad, cumplimiento y confianza comercial.',
      image: 'content/img/img_sector_b1.jpg',
      alt: 'Certificación de productos eléctricos',
    },
    {
      title: 'Electrónicos',
      description:
        'Evaluamos equipos electrónicos y su cumplimiento normativo con criterios técnicos claros.',
      image: 'content/img/img_s1.jpg',
      alt: 'Certificación de productos electrónicos',
    },
    {
      title: 'Telecomunicaciones',
      description:
        'Validamos productos del sector telecom antes de su entrada al mercado.',
      image: 'content/img/img_s2.jpg',
      alt: 'Certificación de productos de telecomunicaciones',
    },
  ];
}
