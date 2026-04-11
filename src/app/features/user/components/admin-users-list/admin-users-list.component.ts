import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../models/user.model';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-admin-users-list',
  templateUrl: './admin-users-list.component.html',
  styleUrls: ['./admin-users-list.component.css']
})
export class AdminUsersListComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(error, 'Impossible de charger les utilisateurs.');
      }
    });
  }

  deleteUser(user: User): void {
    const confirmed = window.confirm(`Supprimer l'utilisateur ${user.email} ?`);
    if (!confirmed) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((currentUser) => currentUser.id !== user.id);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = getHttpErrorMessage(error, 'Suppression impossible.');
      }
    });
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
