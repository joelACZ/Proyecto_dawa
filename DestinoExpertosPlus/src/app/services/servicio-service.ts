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

  /**
   * Obtener todos los servicios
   * @returns Observable<any[]> - Datos crudos del API
   */
  obtenerTodos(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  /**
   * Obtener un servicio por ID
   * @param id - Identificador del servicio
   * @returns Observable<any> - Datos crudos del API
   */
  obtenerPorId(id: number): Observable<any> {
    return this.clienteHttp.get<any>(`${this.urlBase}/${id}`);
  }

  /**
   * Crear un nuevo servicio
   * @param datosServicio - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  crear(datosServicio: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosServicio);
  }

  /**
   * Actualizar un servicio existente
   * @param id - Identificador del servicio
   * @param datosServicio - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  actualizar(id: number, datosServicio: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${id}`, datosServicio);
  }

  /**
   * Eliminar un servicio
   * @param id - Identificador del servicio a eliminar
   * @returns Observable<any> - Respuesta cruda del API
   */
  eliminar(id: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${id}`);
  }

  /**
   * Buscar servicios por nombre o descripción
   * @param termino - Término de búsqueda
   * @returns Observable<any[]> - Resultados filtrados
   */
  buscar(termino: string): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase).pipe(
      map(servicios => servicios.filter(s =>
        s.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        s.descripcion.toLowerCase().includes(termino.toLowerCase())
      ))
    );
  }
}