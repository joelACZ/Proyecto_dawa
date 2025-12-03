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

  getResenas(): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.resenasUrl);
  }

  getResenaById(id: number | string): Observable<Resena> {
    return this.http.get<Resena>(`${this.resenasUrl}/${id}`);
  }

  searchResenas(param: string): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.resenasUrl).pipe(
      map(resenas =>
        resenas.filter(r =>
          r.comentario.toLowerCase().includes(param.toLowerCase()) ||
          String(r.calificacion).includes(param)
        )
      )
    );
  }

  create(resena: any): Observable<Resena> {
    return this.http.post<Resena>(this.resenasUrl, resena);
  }

  update(resena: any): Observable<Resena> {
    const url = `${this.resenasUrl}/${resena.id}`;
    return this.http.put<Resena>(url, resena);
  }

  delete(id: number | string): Observable<Resena> {
    const url = `${this.resenasUrl}/${id}`;
    return this.http.delete<Resena>(url);
  }
}