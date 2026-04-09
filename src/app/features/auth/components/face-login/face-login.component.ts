import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FaceLoginResponse } from '../../../../models/face-login-response.model';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-face-login',
  templateUrl: './face-login.component.html',
  styleUrls: ['./face-login.component.css']
})
export class FaceLoginComponent {
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      tolerance: [null as number | null, [Validators.min(0)]]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Sélectionnez une image avant de continuer.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.faceLogin(this.selectedFile, this.form.value.tolerance).subscribe({
      next: (response: FaceLoginResponse) => {
        this.isSubmitting = false;
        this.successMessage = `Connexion réussie avec une confiance de ${Math.round(response.confidence * 100)}%.`;
        const targetUrl = response.role === 'Admin' ? '/admin/users' : '/profile';
        this.router.navigate([targetUrl]);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getHttpErrorMessage(error, 'Connexion faciale impossible.');
      }
    });
  }
}
