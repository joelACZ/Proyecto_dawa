import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServResenasJson {
  private readonly urlBase = 'http://localhost:3000/resenas';

  constructor(private clienteHttp: HttpClient) {}

  obtenerTodas(): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.urlBase);
  }

  
  obtenerPorId(identificador: number): Observable<any> {
  return this.clienteHttp.get<any>(`${this.urlBase}/${identificador}`);
}
  crear(datosResena: any): Observable<any> {
    return this.clienteHttp.post<any>(this.urlBase, datosResena);
  }
  
  actualizar(identificador: number, datosResena: any): Observable<any> {
    return this.clienteHttp.put<any>(`${this.urlBase}/${identificador}`, datosResena);
  }
  eliminar(identificador: number): Observable<any> {
    return this.clienteHttp.delete<any>(`${this.urlBase}/${identificador}`);
  }

  
  buscarPorTermino(termino: string): Observable<any[]> {
    return this.clienteHttp.get<any[]>(`${this.urlBase}?q=${termino}`);
  }
}