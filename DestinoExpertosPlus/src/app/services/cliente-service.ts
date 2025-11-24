import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Cliente } from '../models/Cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ServClientesJson {

  private clientesUrl = 'http://localhost:3000/clientes';

  constructor(private http: HttpClient) {}

  // GET: obtener todos
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.clientesUrl);
  }

  // GET: por ID
  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.clientesUrl}/${id}`);
  }

  // SEARCH: búsqueda por nombre o email
  searchClientes(param: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.clientesUrl).pipe(
      map(clientes =>
        clientes.filter(c =>
          c.nombre.toLowerCase().includes(param.toLowerCase()) ||
          c.email.toLowerCase().includes(param.toLowerCase())
        )
      )
    );
  }

  // POST: crear
  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.clientesUrl, cliente);
  }

  // PUT: actualizar
  update(cliente: Cliente): Observable<Cliente> {
    const url = `${this.clientesUrl}/${cliente.id}`;
    return this.http.put<Cliente>(url, cliente);
  }

  // DELETE: eliminar
  delete(id: number): Observable<Cliente> {
    const url = `${this.clientesUrl}/${id}`;
    return this.http.delete<Cliente>(url);
  }
}
