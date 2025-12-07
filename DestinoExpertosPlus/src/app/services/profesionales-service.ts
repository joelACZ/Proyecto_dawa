import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServProfesionalesJson {
  private readonly urlBase = 'http://localhost:3000/profesionales';

  constructor(private clienteHttp: HttpClient) {}

  /**
   * Obtener todos los profesionales
   * @returns Observable<any[]> - Datos crudos del API
   */
  obtenerTodos(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  /**
   * Obtener un profesional por ID
   * @param id - Identificador del profesional
   * @returns Observable<any> - Datos crudos del API
   */
  obtenerPorId(id: number): Observable<any> {
    return this.clienteHttp.get<any>(`${this.urlBase}/${id}`);
  }

  /**
   * Crear un nuevo profesional
   * @param datosProfesional - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  crear(datosProfesional: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosProfesional);
  }

  /**
   * Actualizar un profesional existente
   * @param id - Identificador del profesional
   * @param datosProfesional - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  actualizar(id: number, datosProfesional: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${id}`, datosProfesional);
  }

  /**
   * Eliminar un profesional
   * @param id - Identificador del profesional a eliminar
   * @returns Observable<any> - Respuesta cruda del API
   */
  eliminar(id: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${id}`);
  }

  /**
   * Buscar profesionales (si el backend lo soporta)
   * @param termino - Término de búsqueda
   * @returns Observable<any[]> - Resultados crudos
   */
  buscar(termino: string): Observable<any[]> {
    return this.clienteHttp.get<any[]>(`${this.urlBase}?q=${termino}`);
  }
}