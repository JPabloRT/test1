import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../../core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../core/layout/site-header/site-header.component';
import {
  CatalogCarouselComponent,
  CatalogItem,
} from '../../shared/components/catalog-carousel/catalog-carousel.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [SiteHeaderComponent, SiteFooterComponent, CatalogCarouselComponent, RouterLink],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.css',
})
export class AboutPageComponent {
  readonly catalogItems: CatalogItem[] = [
    {
      title: 'Eléctricos',
      description:
        "En NORMALITEC, SC, ofrecemos servicios de certificación de productos con base en las Normas Oficiales Mexicanas (NOM) y en los procedimientos de evaluación de la conformidad aplicables.",
      image: 'content/img/img_sector_b1.jpg',
      alt: 'Sector eléctrico',
    },
    {
      title: 'Electrónicos',
      description:
        'Certificamos dispositivos y equipos para validar seguridad, desempeño y cumplimiento regulatorio para su comercialización.',
      image: 'content/img/img_s1.jpg',
      alt: 'Sector electrónico',
    },
    {
      title: 'Telecomunicaciones',
      description:
        'Evaluamos productos del sector telecom para cumplir requisitos técnicos y normativos antes de su entrada al mercado.',
      image: 'content/img/img_s2.jpg',
      alt: 'Sector telecomunicaciones',
    },
    {
      title: 'Sector Gas',
      description:
        'Realizamos evaluaciones y certificaciones para equipos y sistemas del sector gas, verificando seguridad, desempeño y cumplimiento de normas aplicables.',
      image: 'content/img/img_s3.jpg',
      alt: 'Sector gas',
    },
    {
      title: 'Sector Baterías',
      description:
        'Validamos baterías y sistemas de almacenamiento energético para asegurar confiabilidad operativa, seguridad y cumplimiento regulatorio.',
      image: 'content/img/img_s4.jpg',
      alt: 'Sector baterías',
    },
  ];
}
