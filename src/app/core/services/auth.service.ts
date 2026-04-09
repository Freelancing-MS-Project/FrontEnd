import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { API_BASE_URL, AUTH_STORAGE_KEYS } from '../constants/api.constants';
import { AuthResponse } from '../../models/auth-response.model';
import { FaceLoginResponse } from '../../models/face-login-response.model';
import { LoginRequest } from '../../models/login-request.model';
import { User, UserRole } from '../../models/user.model';

interface SessionResponse {
  authenticated: boolean;
  sessionId?: string;
  userId?: number;
  email?: string;
  role?: UserRole;
  authorities?: string[];
}

interface ConnectedUserResponse {
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = `${API_BASE_URL}/api/auth`;

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, payload).pipe(
      tap((response) => this.storeAuthSession(response)),
      switchMap((response) =>
        this.fetchAndStoreConnectedUserId().pipe(
          map(() => response),
          catchError(() => of(response))
        )
      )
    );
  }

  faceLogin(file: File, tolerance?: number | null): Observable<FaceLoginResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (tolerance !== null && tolerance !== undefined && tolerance !== 0) {
      formData.append('tolerance', String(tolerance));
    }

    return this.http.post<FaceLoginResponse>(`${this.authUrl}/face-login`, formData).pipe(
      tap((response) => this.storeAuthSession(response))
    );
  }

  getSession(): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${this.authUrl}/session`);
  }

  restoreSession(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.getSession().pipe(
      tap((session) => {
        if (session.authenticated && session.email && session.role) {
          localStorage.setItem(AUTH_STORAGE_KEYS.email, session.email);
          localStorage.setItem(AUTH_STORAGE_KEYS.role, session.role);

          if (session.userId !== undefined) {
            localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(session.userId));
          }
        } else if (!session.authenticated) {
          this.logout();
        }
      }),
      switchMap((session) => {
        if (!session.authenticated) {
          return of(false);
        }

        if (session.userId !== undefined) {
          return of(true);
        }

        return this.fetchAndStoreConnectedUserId().pipe(
          map(() => true),
          catchError(() => of(true))
        );
      }),
      catchError(() => of(this.isLoggedIn()))
    );
  }

  getConnectedUserId(): Observable<ConnectedUserResponse> {
    return this.http.get<ConnectedUserResponse>(`${this.authUrl}/getUserConnecteById`);
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.email);
    localStorage.removeItem(AUTH_STORAGE_KEYS.role);
    localStorage.removeItem(AUTH_STORAGE_KEYS.userId);
  }

  isLoggedIn(): boolean {
    return Boolean(this.getToken());
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.token);
  }

  getEmail(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.email);
  }

  getRole(): UserRole | null {
    const role = localStorage.getItem(AUTH_STORAGE_KEYS.role);
    return role as UserRole | null;
  }

  getUserId(): number | null {
    const rawUserId = localStorage.getItem(AUTH_STORAGE_KEYS.userId);
    return rawUserId ? Number(rawUserId) : null;
  }

  updateStoredUserContext(user: Pick<User, 'id' | 'email' | 'role'>): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.email, user.email);
    localStorage.setItem(AUTH_STORAGE_KEYS.role, user.role);
    localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(user.id));
  }

  private fetchAndStoreConnectedUserId(): Observable<number> {
    return this.getConnectedUserId().pipe(
      tap(({ userId }) => {
        localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(userId));
      }),
      map(({ userId }) => userId)
    );
  }

  private storeAuthSession(response: AuthResponse | FaceLoginResponse): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, response.token);
    localStorage.setItem(AUTH_STORAGE_KEYS.email, response.email);
    localStorage.setItem(AUTH_STORAGE_KEYS.role, response.role);

    if ('userId' in response && response.userId !== undefined && response.userId !== null) {
      localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(response.userId));
    }
  }
}
