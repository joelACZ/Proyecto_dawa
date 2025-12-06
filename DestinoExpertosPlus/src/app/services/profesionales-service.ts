import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Profesional } from '../models/Profesional.model';

@Injectable({
  providedIn: 'root'
})
export class ServProfesionalesJson {

  private profesionalesUrl = 'http://localhost:3000/profesionales';

  constructor(private http: HttpClient) {}

  // GET: obtener todos
  getProfesionales(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl);
  }

  // GET: por ID
  getProfesionalById(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.profesionalesUrl}/${id}`);
  }

  // SEARCH: búsqueda por nombre, email o especialidad
  searchProfesionales(param: string): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      map(profesionales =>
        profesionales.filter(p =>
          (p.nombre && p.nombre.toLowerCase().includes(param.toLowerCase())) ||
          (p.email && p.email.toLowerCase().includes(param.toLowerCase())) ||
          (p.especialidad && p.especialidad.toLowerCase().includes(param.toLowerCase()))
        )
      )
    );
  }

  // POST: crear
  create(profesional: Profesional): Observable<Profesional> {
    return this.http.post<Profesional>(this.profesionalesUrl, profesional);
  }

  // PUT: actualizar
  update(profesional: Profesional): Observable<Profesional> {
    const url = `${this.profesionalesUrl}/${profesional.id}`;
    return this.http.put<Profesional>(url, profesional);
  }

  // DELETE: eliminar
  delete(id: number): Observable<Profesional> {
    const url = `${this.profesionalesUrl}/${id}`;
    return this.http.delete<Profesional>(url);
  }
}
