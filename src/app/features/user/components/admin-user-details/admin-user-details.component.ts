import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../models/user.model';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-admin-user-details',
  templateUrl: './admin-user-details.component.html',
  styleUrls: ['./admin-user-details.component.css']
})
export class AdminUserDetailsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  imageUrl: string | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser(id);
  }

  ngOnDestroy(): void {
    this.revokeImageUrl();
  }

  private loadUser(id: number): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: User) => {
        this.user = user;
        this.isLoading = false;
        this.loadImage(user.id);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(error, 'Impossible de charger cet utilisateur.');
      }
    });
  }

  private loadImage(id: number): void {
    this.userService.getUserImage(id).subscribe({
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
