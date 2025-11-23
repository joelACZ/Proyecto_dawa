import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Resena } from '../models/Resena.model';

@Injectable({
  providedIn: 'root'
})
export class ServResenasJson {

  private resenasUrl = 'http://localhost:3000/resenas';

  constructor(private http: HttpClient) {}

  // GET: obtener todas las reseñas
  getResenas(): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.resenasUrl);
  }

  // GET: obtener por ID
  getResenaById(id: number): Observable<Resena> {
    return this.http.get<Resena>(`${this.resenasUrl}/${id}`);
  }

  // SEARCH: filtrar por comentario o calificación
  searchResenas(param: string): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.resenasUrl).pipe(
      map(resenas =>
        resenas.filter(r =>
          r.comentario.toLowerCase().includes(param.toLowerCase()) ||
          r.calificacion.toString().includes(param)
        )
      )
    );
  }

  // POST: crear reseña
  create(resena: Resena): Observable<Resena> {
    return this.http.post<Resena>(this.resenasUrl, resena);
  }

  // PUT: actualizar reseña
  update(resena: Resena): Observable<Resena> {
    const url = `${this.resenasUrl}/${resena.id}`;
    return this.http.put<Resena>(url, resena);
  }

  // DELETE: eliminar reseña
  delete(id: number): Observable<Resena> {
    const url = `${this.resenasUrl}/${id}`;
    return this.http.delete<Resena>(url);
  }
}
