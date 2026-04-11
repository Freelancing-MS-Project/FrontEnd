import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  PortfolioAnalysis,
  PortfolioProject,
  CreatePortfolioProjectRequest,
  PortfolioMedia
} from '../../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  // direct call to portfolio microservice
  private apiUrl = 'http://localhost:8085';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getConnectedUserId(): Observable<number> {
    const storedUserId = this.authService.getUserId();

    if (storedUserId) {
      return of(storedUserId);
    }

    return this.authService.getConnectedUserId().pipe(
      map(({ userId }) => userId)
    );
  }

  private getHeaders(userId: number): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Id': String(userId)
    });
  }

  private getUploadHeaders(userId: number): HttpHeaders {
    return new HttpHeaders({
      'X-User-Id': String(userId)
    });
  }

  getProjects(): Observable<PortfolioProject[]> {
    return this.getConnectedUserId().pipe(
      switchMap((userId) =>
        this.http.get<PortfolioProject[]>(
          `${this.apiUrl}/profiles/me/portfolio`,
          {
            headers: this.getHeaders(userId)
          }
        )
      )
    );
  }

  addProject(payload: CreatePortfolioProjectRequest): Observable<PortfolioProject> {
    return this.getConnectedUserId().pipe(
      switchMap((userId) =>
        this.http.post<PortfolioProject>(
          `${this.apiUrl}/profiles/me/portfolio`,
          payload,
          {
            headers: this.getHeaders(userId)
          }
        )
      )
    );
  }

  updateProject(
    projectId: number,
    payload: CreatePortfolioProjectRequest
  ): Observable<PortfolioProject> {
    return this.getConnectedUserId().pipe(
      switchMap((userId) =>
        this.http.put<PortfolioProject>(
          `${this.apiUrl}/profiles/me/portfolio/${projectId}`,
          payload,
          {
            headers: this.getHeaders(userId)
          }
        )
      )
    );
  }

  deleteProject(projectId: number): Observable<void> {
    return this.getConnectedUserId().pipe(
      switchMap((userId) =>
        this.http.delete<void>(
          `${this.apiUrl}/profiles/me/portfolio/${projectId}`,
          {
            headers: this.getHeaders(userId)
          }
        )
      )
    );
  }

  getAnalysis(freelancerId: number, username: string): Observable<PortfolioAnalysis> {
    const params = new HttpParams().set('username', username);

    return this.getConnectedUserId().pipe(
      switchMap((userId) =>
        this.http.get<PortfolioAnalysis>(
          `${this.apiUrl}/portfolio/freelancer/${freelancerId}/analysis`,
          {
            headers: this.getHeaders(userId),
            params
          }
        )
      )
    );
  }

  uploadProjectMedia(
    projectId: number,
    file: File,
    type: string = 'IMAGE',
    displayOrder?: number
  ): Observable<PortfolioMedia> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    if (displayOrder !== undefined && displayOrder !== null) {
      formData.append('displayOrder', displayOrder.toString());
    }

    return this.getConnectedUserId().pipe(
      switchMap((userId) =>
        this.http.post<PortfolioMedia>(
          `${this.apiUrl}/profiles/me/portfolio/${projectId}/media/upload`,
          formData,
          {
            headers: this.getUploadHeaders(userId)
          }
        )
      )
    );
  }

  deleteMedia(mediaId: number): Observable<void> {
    return this.getConnectedUserId().pipe(
      switchMap((userId) =>
        this.http.delete<void>(
          `${this.apiUrl}/profiles/me/portfolio/media/${mediaId}`,
          {
            headers: this.getUploadHeaders(userId)
          }
        )
      )
    );
  }
}