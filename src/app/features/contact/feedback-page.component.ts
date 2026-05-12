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
  selector: 'app-feedback-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './feedback-page.component.html',
  styleUrl: './feedback-page.component.css',
})
export class FeedbackPageComponent {
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
    subject: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    comments: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  async submit(): Promise<void> {
    this.error.set('');
    this.sent.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const result = await this.contactService.submitFeedbackRequest(this.form.getRawValue());
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
      subject: '',
      comments: '',
    });
  }
}
