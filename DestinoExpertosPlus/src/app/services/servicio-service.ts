import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Servicio } from '../models/Servicio.model';

@Injectable({
  providedIn: 'root'
})
export class ServServiciosJson {
  private readonly urlBase = 'http://localhost:3000/servicios';

  constructor(private clienteHttp: HttpClient) {}

  obtenerTodos(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  
  obtenerPorId(id: number): Observable<any> {
    return this.clienteHttp.get<any>(`${this.urlBase}/${id}`);
  }
  crear(datosServicio: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosServicio);
  }

  
  actualizar(id: number, datosServicio: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${id}`, datosServicio);
  }
  eliminar(id: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${id}`);
  }

  
  buscar(termino: string): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase).pipe(
      map(servicios => servicios.filter(s =>
        s.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        s.descripcion.toLowerCase().includes(termino.toLowerCase())
      ))
    );
  }
}