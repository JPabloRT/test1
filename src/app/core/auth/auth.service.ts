import { Injectable, computed, signal } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

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
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

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
      const { data: profile, error: profileError } = await this.supabase
        .schema('ntec')
        .from('profiles')
        .select('id_cliente')
        .eq('id', currentUser.id)
        .single();

      if (profileError || !profile) {
        this.portalClientSignal.set(null);
        return;
      }

      const { data: client, error: clientError } = await this.supabase
        .schema('ntec')
        .from('cliente')
        .select('id_cliente, nombre, correo, telefono, direccion_sol')
        .eq('id_cliente', profile.id_cliente)
        .single();

      if (clientError || !client) {
        this.portalClientSignal.set(null);
        return;
      }

      const { data: requests, error: requestsError } = await this.supabase
        .schema('ntec')
        .from('solicitud')
        .select(
          `
          id_sol,
          servicio,
          estatus,
          etapa_actual,
          documento (
            id_doc,
            tipo,
            fechas (
              vigencia
            )
          )
        `,
        )
        .eq('id_cliente', client.id_cliente)
        .order('fecha_ingreso', { ascending: false });

      if (requestsError) {
        this.portalClientSignal.set(null);
        return;
      }

      const mappedRequests: PortalRequestSummary[] = (requests ?? []).map(
        (request: any) => {
          const documentRow = Array.isArray(request.documento)
            ? request.documento[0]
            : request.documento;
          const dateRow = Array.isArray(documentRow?.fechas)
            ? documentRow.fechas[0]
            : documentRow?.fechas;

          return {
            id: request.id_sol,
            service: request.servicio,
            status: request.estatus,
            stage: request.etapa_actual ?? 'Sin etapa',
            documentId: documentRow?.id_doc ?? 'Sin documento',
            documentType: documentRow?.tipo ?? 'No definido',
            expiresOn: dateRow?.vigencia ?? null,
          };
        },
      );

      this.portalClientSignal.set({
        id: client.id_cliente,
        name: client.nombre,
        email: client.correo,
        phone: client.telefono,
        address: client.direccion_sol,
        requests: mappedRequests,
      });
    } finally {
      this.loadingPortalSignal.set(false);
    }
  }
}
