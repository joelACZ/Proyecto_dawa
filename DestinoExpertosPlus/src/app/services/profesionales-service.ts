// profesional-service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profesional } from '../models/Profesional.model';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalService {
  private profesionalesUrl = 'http://localhost:3000/profesionales';

  constructor(private http: HttpClient) {}

  getProfesionales(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl);
  }

  getProfesionalById(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.profesionalesUrl}/${id}`);
  }

  // ... otros métodos CRUD similares a los otros servicios
}