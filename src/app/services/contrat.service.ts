import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Contrat } from '../models/contrat';
import { Mission } from '../models/mission';

interface SignContractPayload {
  signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private readonly baseUrl = 'http://localhost:8084/api/contracts';

  constructor(private readonly http: HttpClient) {}

  create(contrat: Partial<Contrat>): Observable<Contrat> {
    return this.http.post<Contrat>(this.baseUrl, contrat);
  }

  getById(id: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.baseUrl}/${id}`);
  }

  signContract(id: number, signature: string): Observable<void> {
    const payload: SignContractPayload = { signature };
    return this.http.post<void>(`${this.baseUrl}/${id}/sign`, payload);
  }

  getAll(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.baseUrl);
  }

  getAllMissions(): Observable<Mission[]> {
    return this.http.get<Mission[] | Mission>(`${this.baseUrl}/mission/getAllMissions`).pipe(
      map((response) => Array.isArray(response) ? response : [response])
    );
  }
}
