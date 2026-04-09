import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  imageUrl: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.refreshUserVisuals();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.refreshUserVisuals());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revokeImageUrl();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'Admin';
  }

  get email(): string {
    return this.authService.getEmail() ?? '';
  }

  get userInitial(): string {
    return this.email ? this.email.charAt(0).toUpperCase() : 'U';
  }

  logout(): void {
    this.authService.logout();
    this.revokeImageUrl();
    this.router.navigate(['/home']);
  }

  private refreshUserVisuals(): void {
    if (!this.isLoggedIn) {
      this.revokeImageUrl();
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      return;
    }

    this.userService.getUserImage(userId).subscribe({
      next: (blob: Blob) => {
        this.revokeImageUrl();
        this.imageUrl = URL.createObjectURL(blob);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.revokeImageUrl();
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
