import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
})
export class LoginFormComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly loading = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    remember: new FormControl(false, { nonNullable: true }),
  });

  async submit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const result = await this.authService.login(
        this.form.controls.email.getRawValue(),
        this.form.controls.password.getRawValue(),
      );

      if (!result.ok) {
        this.errorMessage.set(result.message);
        return;
      }

      this.successMessage.set('Acceso correcto. Redirigiendo al portal...');
      await this.router.navigate(['/portal-clientes']);
    } catch {
      this.errorMessage.set(
        'La sesión se abrió, pero hubo un problema al consultar Supabase.',
      );
    } finally {
      this.loading.set(false);
    }
  }

}
