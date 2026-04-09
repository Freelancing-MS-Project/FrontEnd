import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { FaceVerificationResponse } from '../../models/face-verification-response.model';
import { UpdateProfileRequest } from '../../models/update-profile-request.model';
import { User, UserRole } from '../../models/user.model';

export interface RegisterJsonPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cin: string;
  role: UserRole;
}

export interface RegisterMultipartPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  role?: UserRole;
}

export type AdminUserPayload = Partial<User> & {
  email: string;
  role: UserRole;
  password?: string;
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly usersUrl = `${API_BASE_URL}/api/users`;

  constructor(private readonly http: HttpClient) {}

  registerJson(payload: RegisterJsonPayload): Observable<User> {
    return this.http.post<User>(`${this.usersUrl}/register`, payload);
  }

  registerMultipart(payload: RegisterMultipartPayload, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', payload.email);
    formData.append('password', payload.password);

    if (payload.firstName) {
      formData.append('firstName', payload.firstName);
    }

    if (payload.lastName) {
      formData.append('lastName', payload.lastName);
    }

    if (payload.cin) {
      formData.append('cin', payload.cin);
    }

    if (payload.role) {
      formData.append('role', payload.role);
    }

    return this.http.post<User>(`${this.usersUrl}/register`, formData);
  }

  verifyFace(userId: number, file: File): Observable<FaceVerificationResponse> {
    const formData = new FormData();
    formData.append('userId', String(userId));
    formData.append('file', file);

    return this.http.post<FaceVerificationResponse>(`${this.usersUrl}/verify`, formData);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/me`);
  }

  updateMe(payload: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/me`, payload);
  }

  getUserImage(id: number): Observable<Blob> {
    return this.http.get(`${this.usersUrl}/${id}/image`, {
      responseType: 'blob'
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/${id}`);
  }

  createUser(payload: AdminUserPayload): Observable<User> {
    return this.http.post<User>(this.usersUrl, payload);
  }

  updateUser(id: number, payload: AdminUserPayload): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}
