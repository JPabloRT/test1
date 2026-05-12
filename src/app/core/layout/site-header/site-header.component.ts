import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavChildItem {
  label: string;
  route: string;
}

interface NavItem {
  label: string;
  route?: string;
  children?: NavChildItem[];
}

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.css',
})
export class SiteHeaderComponent {
  @Input() light = true;

  readonly navItems: NavItem[] = [
    { label: 'Inicio', route: '/' },
    { label: 'Servicios', route: '/services' },
    { label: 'Noticias', route: '/news' },
    {
      label: 'Contáctanos',
      route: '/contact',
      children: [
        { label: 'Centro de contacto', route: '/contact' },
        { label: 'Estatus de certificado', route: '/contact/certificate-status' },
        { label: 'Quejas y comentarios', route: '/contact/feedback' },
      ],
    },
    { label: '¿Por qué elegirnos?', route: '/about' },
    { label: 'Clientes', route: '/clients' },
  ];
}
