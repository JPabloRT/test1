import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  Session,
  User,
} from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';

export interface PortalRequestSummary {
  id: string;
  service: string;
  status: string;
  stage: string;
  documentId: string;
  documentType: string;
  expiresOn: string | null;
}

export interface PortalClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  requests: PortalRequestSummary[];
}

type AuthResult = { ok: true } | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;

  private readonly sessionSignal = signal<Session | null>(null);
  private readonly userSignal = signal<User | null>(null);
  private readonly initializedSignal = signal(false);
  private readonly loadingPortalSignal = signal(false);
  private readonly portalClientSignal = signal<PortalClient | null>(null);

  readonly session = this.sessionSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly portalClient = this.portalClientSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();
  readonly loadingPortal = this.loadingPortalSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  private initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.initializeSession();

    this.supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: AuthSession | null) => {
        this.sessionSignal.set(session);
        this.userSignal.set(session?.user ?? null);

        if (session?.user) {
          queueMicrotask(() => {
            void this.loadPortalClient();
          });
        } else {
          this.portalClientSignal.set(null);
        }
      },
    );
  }

  async ensureInitialized(): Promise<void> {
    await this.initializationPromise;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        ok: false,
        message: 'No fue posible iniciar sesión. Revisa tu correo y contraseña.',
      };
    }

    await this.loadPortalClient();
    return { ok: true };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.portalClientSignal.set(null);
  }

  async refreshPortalClient(): Promise<void> {
    await this.loadPortalClient();
  }

  private async initializeSession(): Promise<void> {
    const { data, error } = await this.supabase.auth.getSession();

    if (!error) {
      this.sessionSignal.set(data.session);
      this.userSignal.set(data.session?.user ?? null);

      if (data.session?.user) {
        await this.loadPortalClient();
      }
    }

    this.initializedSignal.set(true);
  }

  private async loadPortalClient(): Promise<void> {
    const currentUser = this.userSignal();

    if (!currentUser) {
      this.portalClientSignal.set(null);
      return;
    }

    this.loadingPortalSignal.set(true);

    try {
      const { data: profileRow, error: profileError } = await this.supabase
        .rpc('get_portal_profile', { p_user_id: currentUser.id })
        .single();

      if (profileError || !profileRow) {
        this.portalClientSignal.set(null);
        return;
      }

      const clientId = (profileRow as any).id_cliente;

      const { data: client, error: clientError } = await this.supabase
        .rpc('get_portal_cliente', { p_id_cliente: clientId })
        .single();

      if (clientError || !client) {
        this.portalClientSignal.set(null);
        return;
      }

      const { data: requests, error: requestsError } = await this.supabase
        .rpc('get_portal_requests', { p_id_cliente: clientId });

      if (requestsError) {
        this.portalClientSignal.set(null);
        return;
      }

      const mappedRequests: PortalRequestSummary[] = ((requests ?? []) as any[]).map(
        (row: any) => ({
          id: row.id_sol,
          service: row.servicio,
          status: row.estatus,
          stage: row.etapa_actual ?? 'Sin etapa',
          documentId: row.documento_id_doc ?? 'Sin documento',
          documentType: row.documento_tipo ?? 'No definido',
          expiresOn: row.fechas_vigencia ?? null,
        }),
      );

      this.portalClientSignal.set({
        id: (client as any).id_cliente,
        name: (client as any).nombre,
        email: (client as any).correo,
        phone: (client as any).telefono,
        address: (client as any).direccion_sol,
        requests: mappedRequests,
      });
    } finally {
      this.loadingPortalSignal.set(false);
    }
  }
}
