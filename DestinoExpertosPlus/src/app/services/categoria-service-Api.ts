import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServCategoriasAPI {
  private readonly urlBase = 'http://localhost:5257/api/categorias';

  constructor(private clienteHttp: HttpClient) {}

  obtenerTodas(): Observable<Categoria[]> {
    return this.clienteHttp.get<Categoria[]>(this.urlBase);
  }

  obtenerPorNombre(nombre: string): Observable<Categoria> {
    return this.clienteHttp.get<Categoria>(`${this.urlBase}/${encodeURIComponent(nombre)}`);
  }

  crear(datosCategoria: Categoria): Observable<Categoria> {
    return this.clienteHttp.post<Categoria>(this.urlBase, datosCategoria);
  }

  actualizar(nombre: string, datosCategoria: Categoria): Observable<any> {
    return this.clienteHttp.put(`${this.urlBase}/${encodeURIComponent(nombre)}`, datosCategoria);
  }

  eliminar(nombre: string): Observable<any> {
    return this.clienteHttp.delete(`${this.urlBase}/${encodeURIComponent(nombre)}`);
  }
}