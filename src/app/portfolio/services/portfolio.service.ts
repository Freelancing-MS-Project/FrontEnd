import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private apiUrl = 'http://localhost:9091';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Id': '1'
    });
  }

  private getUploadHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-User-Id': '1'
    });
  }

  getProjects(): Observable<PortfolioProject[]> {
    return this.http.get<PortfolioProject[]>(
      `${this.apiUrl}/profiles/me/portfolio`,
      { headers: this.getHeaders() }
    );
  }

  addProject(payload: CreatePortfolioProjectRequest): Observable<PortfolioProject> {
    return this.http.post<PortfolioProject>(
      `${this.apiUrl}/profiles/me/portfolio`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  updateProject(
    projectId: number,
    payload: CreatePortfolioProjectRequest
  ): Observable<PortfolioProject> {
    return this.http.put<PortfolioProject>(
      `${this.apiUrl}/profiles/me/portfolio/${projectId}`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  deleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/profiles/me/portfolio/${projectId}`,
      { headers: this.getHeaders() }
    );
  }

  getAnalysis(freelancerId: number, username: string): Observable<PortfolioAnalysis> {
    const params = new HttpParams().set('username', username);

    return this.http.get<PortfolioAnalysis>(
      `${this.apiUrl}/portfolio/freelancer/${freelancerId}/analysis`,
      {
        headers: this.getHeaders(),
        params
      }
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

    return this.http.post<PortfolioMedia>(
      `${this.apiUrl}/profiles/me/portfolio/${projectId}/media/upload`,
      formData,
      { headers: this.getUploadHeaders() }
    );
  }

  deleteMedia(mediaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/profiles/me/portfolio/media/${mediaId}`,
      {
        headers: this.getUploadHeaders()
      }
    );
  }
}