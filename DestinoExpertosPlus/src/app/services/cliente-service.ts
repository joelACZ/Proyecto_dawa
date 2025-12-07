import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServClientesJson {
  private readonly urlBase = 'http://localhost:3000/clientes';

  constructor(private clienteHttp: HttpClient) {}

  /**
   * Obtener todos los clientes
   * @returns Observable<any[]> - Datos crudos del API
   */
  obtenerTodos(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  /**
   * Obtener un cliente por ID
   * @param identificador - Identificador único del cliente
   * @returns Observable<any> - Datos crudos del API
   */
  obtenerPorId(identificador: number): Observable<any> {
    return this.clienteHttp.get<any>(`${this.urlBase}/${identificador}`);
  }

  /**
   * Crear un nuevo cliente
   * @param datosCliente - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  crear(datosCliente: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosCliente);
  }

  /**
   * Actualizar un cliente existente
   * @param identificador - Identificador del cliente a actualizar
   * @param datosCliente - Datos ya formateados para el API
   * @returns Observable<any> - Respuesta cruda del API
   */
  actualizar(identificador: number, datosCliente: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${identificador}`, datosCliente);
  }

  /**
   * Eliminar un cliente
   * @param identificador - Identificador del cliente a eliminar
   * @returns Observable<any> - Respuesta cruda del API
   */
  eliminar(identificador: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${identificador}`);
  }
}