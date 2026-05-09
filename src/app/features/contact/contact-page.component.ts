import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../../core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../core/layout/site-header/site-header.component';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [SiteHeaderComponent, SiteFooterComponent, RouterLink],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css',
})
export class ContactPageComponent {}
