import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';

export interface CertificateStatusRequestPayload {
  name: string;
  company: string;
  phone: string;
  email: string;
  holder: string;
  certificateNumber: string;
  issueDate: string;
  standard: string;
  comments: string;
}

export interface FeedbackRequestPayload {
  name: string;
  company: string;
  phone: string;
  email: string;
  subject: string;
  comments: string;
}

export interface RegistrationRequestPayload {
  name: string;
  company: string;
  phone: string;
  email: string;
  comments: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly supabase = inject(SupabaseService).client;

  async submitCertificateStatusRequest(
    payload: CertificateStatusRequestPayload,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const { error } = await this.supabase.functions.invoke(
      'certificate-status-request',
      {
        body: payload,
      },
    );

    if (error) {
      return {
        ok: false,
        message:
          'No fue posible enviar la solicitud en este momento. Intenta nuevamente.',
      };
    }

    return { ok: true };
  }

  async submitFeedbackRequest(
    payload: FeedbackRequestPayload,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const { error } = await this.supabase.functions.invoke(
      'feedback-request',
      {
        body: payload,
      },
    );

    if (error) {
      return {
        ok: false,
        message:
          'No fue posible enviar tu comentario en este momento. Intenta nuevamente.',
      };
    }

    return { ok: true };
  }

  async submitRegistrationRequest(
    payload: RegistrationRequestPayload,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const { data, error } = await this.supabase.functions.invoke(
      'registration-request',
      {
        body: payload,
      },
    );

    if (error) {
      return {
        ok: false,
        message:
          'No fue posible enviar tu solicitud de registro en este momento. Intenta nuevamente.',
      };
    }

    return { ok: true };
  }
}
