import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FaceLoginComponent } from './features/auth/components/face-login/face-login.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { AdminUserDetailsComponent } from './features/user/components/admin-user-details/admin-user-details.component';
import { AdminUserFormComponent } from './features/user/components/admin-user-form/admin-user-form.component';
import { AdminUsersListComponent } from './features/user/components/admin-users-list/admin-users-list.component';
import { ProfileComponent } from './features/user/components/profile/profile.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'users', loadChildren: () => import('./modules/users/users.module').then((u) => u.UsersModule) },
  { path: 'profiles', loadChildren: () => import('./modules/profile/profile.module').then((p) => p.ProfileModule) },
  { path: 'missions', loadChildren: () => import('./modules/mission/mission.module').then((m) => m.MissionModule) },
  { path: 'contrats', loadChildren: () => import('./modules/contrat/contrat.module').then((c) => c.ContratModule) },
{ path: 'reviews', loadChildren: () => import('./modules/review/review.module').then(r=> r.ReviewModule)
    ,data: { showNavbar: false }
  },  { path: 'chats', loadChildren: () => import('./modules/chat/chat.module').then((ch) => ch.ChatModule) },
  { path: 'login', component: LoginComponent },
  { path: 'face-login', component: FaceLoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: AdminUsersListComponent, canActivate: [AdminGuard] },
  { path: 'admin/users/new', component: AdminUserFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/users/:id/edit', component: AdminUserFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/users/:id', component: AdminUserDetailsComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
