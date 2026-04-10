import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUserPayload, UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../models/user.model';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-admin-user-form',
  templateUrl: './admin-user-form.component.html',
  styleUrls: ['./admin-user-form.component.css']
})
export class AdminUserFormComponent implements OnInit {
  readonly roles: UserRole[] = ['Client', 'Freelancer', 'Admin'];
  userId: number | null = null;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      firstName: [''],
      lastName: [''],
      cin: [''],
      role: ['Client' as UserRole, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.userId = Number(idParam);
      this.isEditMode = true;
      this.loadUser(this.userId);
    } else {
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(6)]);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  submit(): void {
    if (!this.isEditMode) {
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(6)]);
      this.form.controls.password.updateValueAndValidity();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = this.buildPayload();
    const request$ = this.isEditMode && this.userId
      ? this.userService.updateUser(this.userId, payload)
      : this.userService.createUser(payload);

    request$.subscribe({
      next: (user: User) => {
        this.isSubmitting = false;
        this.router.navigate(['/admin/users', user.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getHttpErrorMessage(error, 'Enregistrement impossible.');
      }
    });
  }

  private loadUser(id: number): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: User) => {
        this.form.patchValue({
          email: user.email,
          password: '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          cin: user.cin ?? '',
          role: user.role
        });
        this.form.controls.password.clearValidators();
        this.form.controls.password.updateValueAndValidity();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(error, 'Impossible de charger cet utilisateur.');
      }
    });
  }

  private buildPayload(): AdminUserPayload {
    const rawValue = this.form.getRawValue();
    const payload: AdminUserPayload = {
      email: rawValue.email,
      firstName: rawValue.firstName,
      lastName: rawValue.lastName,
      cin: rawValue.cin,
      role: rawValue.role
    };

    if (this.userId) {
      payload.id = this.userId;
    }

    if (rawValue.password) {
      payload.password = rawValue.password;
    }

    return payload;
  }
}
