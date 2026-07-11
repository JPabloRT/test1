import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AboutPageComponent } from './features/about/about-page.component';
import { CertificateStatusPageComponent } from './features/contact/certificate-status-page.component';
import { ClientPortalPageComponent } from './features/client-portal/client-portal-page.component';
import { ClientsPageComponent } from './features/clients/clients-page.component';
import { RegistrationPageComponent } from './features/clients/registration-page.component';
import { ContactPageComponent } from './features/contact/contact-page.component';
import { FeedbackPageComponent } from './features/contact/feedback-page.component';
import { HomePageComponent } from './features/home/home-page.component';
import { NewsPageComponent } from './features/news/news-page.component';
import { ServicesPageComponent } from './features/services/services-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Normalitec SC' },
  { path: 'services', component: ServicesPageComponent, title: 'Servicios | Normalitec SC' },
  { path: 'about', component: AboutPageComponent, title: 'Por qué elegirnos | Normalitec SC' },
  { path: 'contact', component: ContactPageComponent, title: 'Contacto | Normalitec SC' },
  {
    path: 'contact/certificate-status',
    component: CertificateStatusPageComponent,
    title: 'Estatus de certificado | Normalitec SC',
  },
  {
    path: 'contact/feedback',
    component: FeedbackPageComponent,
    title: 'Quejas y comentarios | Normalitec SC',
  },
  { path: 'news', component: NewsPageComponent, title: 'Noticias | Normalitec SC' },
  { path: 'clients', component: ClientsPageComponent, title: 'Clientes | Normalitec SC' },
  { path: 'clients/register', component: RegistrationPageComponent, title: 'Registro | Normalitec SC' },
  {
    path: 'portal-clientes',
    component: ClientPortalPageComponent,
    canActivate: [authGuard],
    title: 'Portal de clientes | Normalitec SC',
  },
  { path: '**', redirectTo: '' },
];
