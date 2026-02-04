import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class  ServProfesionalAPI{
  private readonly urlBase = 'http://localhost:5257/api/profesionales';

  constructor(private clienteHttp: HttpClient) {}

  obtenerTodos(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  
  obtenerPorId(id: number): Observable<any> {
    return this.clienteHttp.get<any>(`${this.urlBase}/${id}`);
  }
  crear(datosProfesional: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosProfesional);
  }

  
  actualizar(id: number, datosProfesional: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${id}`, datosProfesional);
  }
  eliminar(id: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${id}`);
  }

  
  buscar(termino: string): Observable<any[]> {
    return this.clienteHttp.get<any[]>(`${this.urlBase}?q=${termino}`);
  }
}