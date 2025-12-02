import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Solicitud } from '../models/Solicitud.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private url = 'http://localhost:3000/solicitudes'; 

  constructor(private http: HttpClient) {}

  getSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.url);
  }

  getSolicitudById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.url}/${id}`);
  }

  searchSolicitudes(param: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.url).pipe(
      map(lista =>
        lista.filter(s =>
          s.descripcion.toLowerCase().includes(param.toLowerCase()) ||
          s.estado.toLowerCase().includes(param.toLowerCase())
        )
      )
    );
  }

  create(solicitud: Solicitud): Observable<Solicitud> {
    const payload = { ...solicitud, fecha: new Date() }; 
    return this.http.post<Solicitud>(this.url, payload);
  }

  update(solicitud: Solicitud): Observable<Solicitud> {
    const url = `${this.url}/${solicitud.id}`;
    return this.http.put<Solicitud>(url, solicitud);
  }

  delete(id: number): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http.delete(url);
  }
}
