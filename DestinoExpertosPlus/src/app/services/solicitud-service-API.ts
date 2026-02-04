import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServSolicitudAPI {
  private readonly API_URL = 'http://localhost:5257/api/solicitudes';

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }
  obtenerFiltradas(filtros: {
    busqueda?: string;
    estado?: string;
    urgente?: boolean;
    clienteId?: number;
    profesionalId?: number;
    servicioId?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
  }): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(solicitudes => this.aplicarFiltros(solicitudes, filtros))
    );
  }

  obtenerPaginadas(
    pagina: number,
    itemsPorPagina: number,
    filtros?: any
  ): Observable<{
    datos: any[];
    total: number;
    totalPaginas: number;
  }> {
    return this.obtenerFiltradas(filtros || {}).pipe(
      map(solicitudes => {
        const total = solicitudes.length;
        const inicio = (pagina - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;

        return {
          datos: solicitudes.slice(inicio, fin),
          total,
          totalPaginas: Math.ceil(total / itemsPorPagina)
        };
      })
    );
  }

  
  crear(datosSolicitud: any): Observable<any> {
    const solicitudConFecha = {
      ...datosSolicitud,
      fecha: new Date().toISOString(),
      estado: datosSolicitud.estado || 'pendiente'
    };
    return this.http.post<any>(this.API_URL, solicitudConFecha);
  }

  
  actualizar(id: number, datosSolicitud: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, datosSolicitud);
  }
  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/${id}`, { estado });
  }

  
  actualizarUrgencia(id: number, urgencia: boolean, nivelUrgencia?: string): Observable<any> {
    const datos: any = { urgencia };
    if (nivelUrgencia) datos.nivelUrgencia = nivelUrgencia;
    return this.http.patch<any>(`${this.API_URL}/${id}`, datos);
  }
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`);
  }

  private aplicarFiltros(solicitudes: any[], filtros: any): any[] {
    return solicitudes.filter(s => {
      
      if (filtros.clienteId && s.cliente_id !== filtros.clienteId) return false;
      if (filtros.profesionalId && s.profesional_id !== filtros.profesionalId) return false;
      if (filtros.servicioId && s.servicio_id !== filtros.servicioId) return false;

      
      if (filtros.estado && s.estado !== filtros.estado) return false;
      if (filtros.urgente !== undefined && s.urgencia !== filtros.urgente) return false;
      if (filtros.busqueda) {
        const textoBusqueda = filtros.busqueda.toLowerCase();
        const textoMatch =
          s.descripcion?.toLowerCase().includes(textoBusqueda) ||
          s.ubicacion?.toLowerCase().includes(textoBusqueda) ||
          s.estado?.toLowerCase().includes(textoBusqueda);
        if (!textoMatch) return false;
      }
      if (filtros.fechaInicio || filtros.fechaFin) {
        const fechaSolicitud = new Date(s.fecha);
        if (filtros.fechaInicio && fechaSolicitud < filtros.fechaInicio) return false;
        if (filtros.fechaFin && fechaSolicitud > filtros.fechaFin) return false;
      }

      return true;
    });
  }
}

