import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthService,
  PortalRequestSummary,
} from '../../core/auth/auth.service';

type SidebarView = 'companies' | 'alerts';
type CompanyTab = 'services' | 'profile' | 'users';
type CompanyScreen =
  | 'companies-list'
  | 'services-list'
  | 'service-detail'
  | 'service-create'
  | 'profile-main'
  | 'profile-document'
  | 'users-list'
  | 'user-create';

interface PortalAlert {
  id: string;
  title: string;
  body: string;
  tone: 'success' | 'warning' | 'info';
  group: string;
  date: string;
}

interface PortalAlertGroup {
  title: string;
  items: PortalAlert[];
}

interface PortalUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
}

interface CompanyCard {
  id: string;
  name: string;
  subtitle: string;
  generatedServices: number;
  accent: 'green' | 'blue' | 'red';
}

interface DocumentVersion {
  version: string;
  note: string;
  author: string;
  date: string;
}

interface DocumentComment {
  id: string;
  author: string;
  role: string;
  body: string;
  time: string;
}

@Component({
  selector: 'app-client-portal-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-portal-page.component.html',
  styleUrl: './client-portal-page.component.css',
})
export class ClientPortalPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly serviceTypeOptions = [
    'Renovación',
    'Certificación inicial',
    'Dictamen',
    'Carta justificación técnica',
    'Carta aduana',
    'Modificación',
    'Otro',
  ];

  readonly permissionOptions = [
    'Visualizar servicios',
    'Solicitar nuevos servicios',
    'Visualizar documentación legal',
    'Subir y editar documentación legal',
  ];

  readonly client = this.authService.portalClient;
  readonly loading = this.authService.loadingPortal;

  readonly activeSidebarView = signal<SidebarView>('companies');
  readonly activeCompanyTab = signal<CompanyTab>('services');
  readonly currentScreen = signal<CompanyScreen>('companies-list');
  readonly selectedRequestId = signal<string | null>(null);
  readonly selectedServiceType = signal('Certificación inicial');

  readonly requests = computed(() => this.client()?.requests ?? []);
  readonly hasRequests = computed(() => this.requests().length > 0);
  readonly selectedRequest = computed(() => {
    const records = this.requests();

    if (!records.length) {
      return null;
    }

    const currentId = this.selectedRequestId();
    return records.find((request) => request.id === currentId) ?? records[0];
  });

  readonly companyName = computed(() => this.client()?.name ?? 'Empresa vinculada');
  readonly companyNameUpper = computed(() => this.companyName().toUpperCase());
  readonly clientEmail = computed(
    () => this.client()?.email ?? 'Sin correo registrado',
  );
  readonly clientPhone = computed(
    () => this.client()?.phone ?? 'Sin teléfono registrado',
  );
  readonly clientAddress = computed(
    () => this.client()?.address ?? 'Sin dirección registrada',
  );

  readonly portalUserName = computed(() => this.companyName());
  readonly portalUserEmail = computed(() => this.clientEmail());
  readonly clientInitials = computed(() => {
    const name = this.portalUserName();
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  });

  readonly totalRequests = computed(() => this.requests().length);
  readonly inProgressRequests = computed(() =>
    this.requests().filter((request) => {
      const normalized = request.status.toLowerCase();
      return (
        normalized.includes('pend') ||
        normalized.includes('revisión') ||
        normalized.includes('revision') ||
        normalized.includes('observ')
      );
    }).length,
  );
  readonly completedRequests = computed(() =>
    this.requests().filter((request) => {
      const normalized = request.status.toLowerCase();
      return (
        normalized.includes('emit') ||
        normalized.includes('vigent') ||
        normalized.includes('termin') ||
        normalized.includes('complet')
      );
    }).length,
  );
  readonly latestExpiry = computed(() => {
    const requests = this.requests().filter((request) => request.expiresOn);

    if (!requests.length) {
      return 'Sin fecha disponible';
    }

    const sorted = [...requests].sort((left, right) =>
      (left.expiresOn ?? '').localeCompare(right.expiresOn ?? ''),
    );

    return this.formatLongDate(sorted[0].expiresOn);
  });

  readonly companies = computed<CompanyCard[]>(() => [
    {
      id: this.client()?.id ?? 'EMP-001',
      name: this.companyNameUpper(),
      subtitle: this.client()?.id ?? 'Identificador de empresa',
      generatedServices: this.totalRequests(),
      accent: 'green',
    },
  ]);

  readonly documentRows = computed(() =>
    this.requests().map((request) => ({
      id: `${request.documentId}.pdf`,
      subtitle: request.documentType,
      status: request.status,
    })),
  );

  readonly userRows = computed<PortalUserRow[]>(() => [
    {
      id: this.clientInitials() || 'CL',
      name: this.portalUserName(),
      email: this.portalUserEmail(),
      role: 'Administrador',
      permissions: 'Todos',
    },
  ]);

  readonly alerts = computed<PortalAlert[]>(() =>
    this.requests().map((request, index) => ({
      id: request.id,
      title: `Actualización en la solicitud ${request.id}`,
      body: `${request.service} se encuentra en ${request.stage.toLowerCase()}.`,
      tone: this.mapAlertTone(request.status),
      group: index < 2 ? 'Hoy' : index < 4 ? 'Ayer' : 'Anteriores',
      date: this.currentDateTimeLabel(index),
    })),
  );

  readonly alertGroups = computed<PortalAlertGroup[]>(() => {
    const groups = ['Hoy', 'Ayer', 'Anteriores'];
    const alerts = this.alerts();

    return groups
      .map((title) => ({
        title,
        items: alerts.filter((alert) => alert.group === title),
      }))
      .filter((group) => group.items.length > 0);
  });

  readonly documentVersions = computed<DocumentVersion[]>(() => {
    const request = this.selectedRequest();

    if (!request) {
      return [];
    }

    return [
      {
        version: 'v3.0',
        note: 'Versión visible para consulta en el portal.',
        author: this.portalUserName(),
        date: this.formatShortDate(request.expiresOn),
      },
      {
        version: 'v2.1',
        note: 'Actualización administrativa del expediente.',
        author: 'Admin Normalitec',
        date: this.currentDateTimeLabel(1),
      },
    ];
  });

  readonly documentComments = computed<DocumentComment[]>(() => {
    const request = this.selectedRequest();

    if (!request) {
      return [];
    }

    return [
      {
        id: 'comment-1',
        author: 'Admin Normalitec',
        role: 'Revisión técnica',
        body: `El documento asociado a ${request.id} se encuentra disponible para consulta y seguimiento.`,
        time: 'Hace 2 horas',
      },
      {
        id: 'comment-2',
        author: this.portalUserName(),
        role: 'Cuenta cliente',
        body: 'Se revisó el documento en el portal sin observaciones adicionales.',
        time: 'Hace 1 día',
      },
    ];
  });

  readonly breadcrumb = computed(() => {
    const crumbs = ['Normalitec customer portal'];

    if (this.activeSidebarView() === 'alerts') {
      crumbs.push('Alertas');
      return crumbs;
    }

    crumbs.push('Empresas');

    if (this.currentScreen() !== 'companies-list') {
      crumbs.push(this.companyNameUpper());
    }

    switch (this.currentScreen()) {
      case 'service-detail':
      case 'service-create':
        crumbs.push('Servicios');
        break;
      case 'profile-document':
        crumbs.push('Perfil');
        break;
      case 'user-create':
        crumbs.push('Usuarios');
        break;
    }

    return crumbs;
  });

  openCompaniesList(): void {
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('services');
    this.currentScreen.set('companies-list');
  }

  openAlerts(): void {
    this.activeSidebarView.set('alerts');
  }

  openCompanyServices(): void {
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('services');
    this.currentScreen.set('services-list');
  }

  openCompanyProfile(): void {
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('profile');
    this.currentScreen.set('profile-main');
  }

  openCompanyUsers(): void {
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('users');
    this.currentScreen.set('users-list');
  }

  openServiceDetail(request: PortalRequestSummary): void {
    this.selectedRequestId.set(request.id);
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('services');
    this.currentScreen.set('service-detail');
  }

  openServiceCreate(): void {
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('services');
    this.currentScreen.set('service-create');
  }

  openProfileDocument(): void {
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('profile');
    this.currentScreen.set('profile-document');
  }

  openUsersCreate(): void {
    this.activeSidebarView.set('companies');
    this.activeCompanyTab.set('users');
    this.currentScreen.set('user-create');
  }

  selectServiceType(type: string): void {
    this.selectedServiceType.set(type);
  }

  getStatusTone(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized.includes('observ')) {
      return 'status-warning';
    }

    if (normalized.includes('pend')) {
      return 'status-muted';
    }

    if (normalized.includes('revisión') || normalized.includes('revision')) {
      return 'status-info';
    }

    if (
      normalized.includes('emit') ||
      normalized.includes('vigent') ||
      normalized.includes('termin') ||
      normalized.includes('complet')
    ) {
      return 'status-success';
    }

    return 'status-default';
  }

  getUserRoleTone(role: string): string {
    switch (role.toLowerCase()) {
      case 'administrador':
        return 'tag-blue';
      case 'soporte':
        return 'tag-gray';
      default:
        return 'tag-green';
    }
  }

  getAlertToneClass(tone: PortalAlert['tone']): string {
    return `alert-${tone}`;
  }

  formatDate(date: string | null): string {
    if (!date) {
      return 'Sin fecha disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  logout(): void {
    void this.authService.logout().then(() => this.router.navigate(['/clients']));
  }

  private currentDateTimeLabel(dayOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);

    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private formatLongDate(date: string | null): string {
    if (!date) {
      return 'Sin fecha disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  }

  private formatShortDate(date: string | null): string {
    if (!date) {
      return this.currentDateTimeLabel(0);
    }

    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  private mapAlertTone(status: string): PortalAlert['tone'] {
    const normalized = status.toLowerCase();

    if (normalized.includes('observ')) {
      return 'warning';
    }

    if (
      normalized.includes('emit') ||
      normalized.includes('vigent') ||
      normalized.includes('termin') ||
      normalized.includes('complet')
    ) {
      return 'success';
    }

    return 'info';
  }
}
