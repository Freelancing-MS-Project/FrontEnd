import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminUserDetailsComponent } from './components/admin-user-details/admin-user-details.component';
import { AdminUserFormComponent } from './components/admin-user-form/admin-user-form.component';
import { AdminUsersListComponent } from './components/admin-users-list/admin-users-list.component';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  declarations: [
    ProfileComponent,
    AdminUsersListComponent,
    AdminUserFormComponent,
    AdminUserDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class UserModule {}
