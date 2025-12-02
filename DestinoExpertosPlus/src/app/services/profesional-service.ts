import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Profesional } from '../models/Profesional.model';

@Injectable({
  providedIn: 'root',
})
export class ProfesionalService {
  
  private url = 'http://localhost:3000/profesionales'; 

  constructor(private http: HttpClient) { }

  getProfesionales(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.url);
  }

  getProfesionalById(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.url}/${id}`);
  }

  create(profesional: Profesional): Observable<Profesional> {
    return this.http.post<Profesional>(this.url, profesional);
  }

  update(profesional: Profesional): Observable<Profesional> {
    const updateUrl = `${this.url}/${profesional.id}`;
    return this.http.put<Profesional>(updateUrl, profesional);
  }
  
  delete(id: number): Observable<any> {
    const deleteUrl = `${this.url}/${id}`;
    return this.http.delete(deleteUrl);
  }
  
  searchProfesionales(param: string): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.url).pipe(
        map(profesionales =>
            profesionales.filter(p =>
                p.nombre.toLowerCase().includes(param.toLowerCase()) ||
                p.especialidad.toLowerCase().includes(param.toLowerCase())
            )
        )
    );
  }
}
