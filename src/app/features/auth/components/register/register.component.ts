import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserRole } from '../../../../models/user.model';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  readonly roles: UserRole[] = ['Client', 'Freelancer', 'Admin'];
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  readonly registerForm;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly router: Router
  ) {
    this.registerForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: [''],
      lastName: [''],
      cin: [''],
      role: ['Client' as UserRole, [Validators.required]]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.registerForm.getRawValue();
    const request$ = this.selectedFile
      ? this.userService.registerMultipart(payload, this.selectedFile)
      : this.userService.registerJson({
          email: payload.email,
          password: payload.password,
          firstName: payload.firstName,
          lastName: payload.lastName,
          cin: payload.cin,
          role: payload.role
        });

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Compte créé avec succès. Vous pouvez maintenant vous connecter.';
        this.registerForm.reset({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          cin: '',
          role: 'Client'
        });
        this.selectedFile = null;
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getHttpErrorMessage(error, 'Inscription impossible.');
      }
    });
  }
}
