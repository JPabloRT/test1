import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContactService } from '../../core/contact/contact.service';
import { SiteFooterComponent } from '../../core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../core/layout/site-header/site-header.component';

@Component({
  selector: 'app-certificate-status-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './certificate-status-page.component.html',
  styleUrl: './certificate-status-page.component.css',
})
export class CertificateStatusPageComponent {
  private readonly contactService = inject(ContactService);

  readonly sent = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    company: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    holder: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    certificateNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    issueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    standard: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    comments: new FormControl('', { nonNullable: true }),
  });

  async submit(): Promise<void> {
    this.error.set('');
    this.sent.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const result = await this.contactService.submitCertificateStatusRequest(
      this.form.getRawValue(),
    );
    this.loading.set(false);

    if (!result.ok) {
      this.error.set(result.message);
      return;
    }

    this.sent.set(true);
    this.form.reset({
      name: '',
      company: '',
      phone: '',
      email: '',
      holder: '',
      certificateNumber: '',
      issueDate: '',
      standard: '',
      comments: '',
    });
  }
}
