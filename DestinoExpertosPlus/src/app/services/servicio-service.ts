import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Servicio } from '../models/Servicio.model';

@Injectable({
  providedIn: 'root'
})
export class ServServiciosJson {

  private servicioUrl = 'http://localhost:3000/servicios';

  constructor(private http: HttpClient) {}

  // GET: obtener todos
  getServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.servicioUrl);
  }

  // GET: por ID
  getServicioById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.servicioUrl}/${id}`);
  }

  // SEARCH: búsqueda por nombre o descripción
  searchServicios(param: string): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.servicioUrl).pipe(
      map(servicios =>
        servicios.filter(s =>
          s.nombre.toLowerCase().includes(param.toLowerCase()) ||
          s.descripcion.toLowerCase().includes(param.toLowerCase())
        )
      )
    );
  }

  // POST: crear
  create(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.servicioUrl, servicio);
  }

  // PUT: actualizar
  update(servicio: Servicio): Observable<Servicio> {
    const url = `${this.servicioUrl}/${servicio.id}`;
    return this.http.put<Servicio>(url, servicio);
  }

  // DELETE: eliminar
  delete(id: number): Observable<Servicio> {
    const url = `${this.servicioUrl}/${id}`;
    return this.http.delete<Servicio>(url);
  }
}
