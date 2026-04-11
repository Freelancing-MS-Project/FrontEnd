// review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  // API Gateway URL
  private baseUrl = 'http://localhost:8093/reviews';

  constructor(private http: HttpClient) { }

  // GET /reviews
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl);
  }

  // GET /reviews/{id}
  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  // POST /reviews
  createReview(review: Review): Observable<Review> {
    // Ajouter les dates si nécessaire
    const now = new Date().toISOString();
    const reviewToSend = {
      ...review,
      createdAt: review.createdAt || now,
      updatedAt: review.updatedAt || now
    };
    return this.http.post<Review>(this.baseUrl, reviewToSend);
  }

  // PUT /reviews/{id}
  updateReview(id: number, review: Review): Observable<Review> {
    review.updatedAt = new Date().toISOString();
    return this.http.put<Review>(`${this.baseUrl}/${id}`, review);
  }

  // DELETE /reviews/{id}
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // GET /reviews/from/{fromUser}
  getReviewsByFromUser(fromUser: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/from/${fromUser}`);
  }

  // GET /reviews/to/{toUser}
  getReviewsByToUser(toUser: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/to/${toUser}`);
  }

  // GET /reviews/mission/{id}/details
  getMissionDetails(missionId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/mission/${missionId}/details`);
  }
  getReviewsByMissionId(missionId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/mission/${missionId}`);
  }

}
