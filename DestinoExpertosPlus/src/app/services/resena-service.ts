import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServResenasJson {
  private readonly urlBase = 'http://localhost:3000/resenas';

  constructor(private clienteHttp: HttpClient) {}

  /**
   * Obtener todas las reseñas
   * @returns Observable<any[]> - Datos crudos del API
   */
  obtenerTodas(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  /**
   * Obtener una reseña por ID
   * @param identificador - Identificador único de la reseña
   * @returns Observable<any> - Datos crudos del API
   */
  obtenerPorId(identificador: number): Observable<any> {
    return this.clienteHttp.get<any>(`${this.urlBase}/${identificador}`);
  }

  /**
   * Crear una nueva reseña
   * @param datosResena - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  crear(datosResena: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosResena);
  }

  /**
   * Actualizar una reseña existente
   * @param identificador - Identificador de la reseña a actualizar
   * @param datosResena - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  actualizar(identificador: number, datosResena: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${identificador}`, datosResena);
  }

  /**
   * Eliminar una reseña
   * @param identificador - Identificador de la reseña a eliminar
   * @returns Observable<any> - Respuesta cruda del API
   */
  eliminar(identificador: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${identificador}`);
  }

  /**
   * Buscar reseñas por término (comentario o calificación)
   * @param termino - Término de búsqueda
   * @returns Observable<any[]> - Datos crudos del API
   */
  buscarPorTermino(termino: string): Observable<any[]> {
    // NOTA: Esta implementación asume que el backend soporta query parameters
    // Si no, se podría hacer el filtrado en el cliente
    return this.clienteHttp.get<any[]>(`${this.urlBase}?q=${termino}`);
  }
}