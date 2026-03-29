import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PortfolioAnalysis,
  PortfolioProject,
  CreatePortfolioProjectRequest
} from '../../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
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

  getAnalysis(freelancerId: number): Observable<PortfolioAnalysis> {
    return this.http.get<PortfolioAnalysis>(
      `${this.apiUrl}/portfolio/freelancer/${freelancerId}/analysis`,
      { headers: this.getHeaders() }
    );
  }
}