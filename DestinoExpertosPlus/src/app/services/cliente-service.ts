import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServClientesJson {
  private readonly urlBase = 'http://localhost:3000/clientes';

  constructor(private clienteHttp: HttpClient) {}

  obtenerTodos(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  obtenerPorId(identificador: number): Observable<any> {
    return this.clienteHttp.get<any>(`${this.urlBase}/${identificador}`);
  }

  crear(datosCliente: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosCliente);
  }

  actualizar(identificador: number, datosCliente: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${identificador}`, datosCliente);
  }

  eliminar(identificador: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${identificador}`);
  }
}