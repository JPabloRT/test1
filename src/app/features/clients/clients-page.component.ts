import { Component } from '@angular/core';
import { SiteFooterComponent } from '../../core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../core/layout/site-header/site-header.component';
import { LoginFormComponent } from '../../shared/components/login-form/login-form.component';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [SiteHeaderComponent, SiteFooterComponent, PageHeroComponent, LoginFormComponent],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.css',
})
export class ClientsPageComponent {}
