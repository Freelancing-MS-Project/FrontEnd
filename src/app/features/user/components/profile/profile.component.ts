import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../models/user.model';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  imageUrl: string | null = null;
  isLoading = false;
  isSaving = false;
  editMode = false;
  errorMessage = '';
  successMessage = '';
  readonly profileForm;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    this.profileForm = this.fb.nonNullable.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      cin: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.revokeImageUrl();
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'Admin';
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getMe().subscribe({
      next: (user: User) => {
        this.user = user;
        this.authService.updateStoredUserContext({
          id: user.id,
          email: user.email,
          role: user.role
        });
        this.profileForm.patchValue({
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          cin: user.cin ?? ''
        });
        this.loadImage(user.id);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(error, 'Impossible de charger votre profil.');
      }
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.successMessage = '';

    if (this.user && this.editMode) {
      this.profileForm.patchValue({
        firstName: this.user.firstName ?? '',
        lastName: this.user.lastName ?? '',
        cin: this.user.cin ?? ''
      });
    }
  }

  save(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.updateMe(this.profileForm.getRawValue()).subscribe({
      next: (user: User) => {
        this.user = user;
        this.editMode = false;
        this.isSaving = false;
        this.successMessage = 'Profil mis à jour avec succès.';
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = getHttpErrorMessage(error, 'Mise à jour impossible.');
      }
    });
  }

  private loadImage(userId: number): void {
    this.userService.getUserImage(userId).subscribe({
      next: (blob: Blob) => {
        this.revokeImageUrl();
        this.imageUrl = URL.createObjectURL(blob);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 404) {
          this.errorMessage = getHttpErrorMessage(error, 'Impossible de charger l’image utilisateur.');
        }
      }
    });
  }

  private revokeImageUrl(): void {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
      this.imageUrl = null;
    }
  }
}
