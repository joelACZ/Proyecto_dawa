import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  // ==================== CONFIGURACIÓN ====================
  private readonly API_URL = 'http://localhost:3000/solicitudes';

  constructor(private http: HttpClient) {}

  // ==================== OPERACIONES DE LECTURA ====================

  /**
   * Obtiene todas las solicitudes sin filtrar
   */
  SolicitudesobtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  /**
   * Obtiene una solicitud específica por ID
   */
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene solicitudes aplicando múltiples filtros simultáneamente
   * Los filtros se aplican en el cliente simulando un backend real
   */
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

  /**
   * Obtiene solicitudes paginadas y filtradas
   * Retorna datos + información de paginación
   */
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

  // ==================== OPERACIONES DE ESCRITURA ====================

  /**
   * Crea una nueva solicitud asignando fecha actual automáticamente
   */
  crear(datosSolicitud: any): Observable<any> {
    const solicitudConFecha = {
      ...datosSolicitud,
      fecha: new Date().toISOString(),
      estado: datosSolicitud.estado || 'pendiente'
    };
    return this.http.post<any>(this.API_URL, solicitudConFecha);
  }

  /**
   * Actualiza una solicitud completamente
   */
  actualizar(id: number, datosSolicitud: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, datosSolicitud);
  }

  /**
   * Actualiza solo el estado de una solicitud
   */
  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/${id}`, { estado });
  }

  /**
   * Actualiza solo la configuración de urgencia
   */
  actualizarUrgencia(id: number, urgencia: boolean, nivelUrgencia?: string): Observable<any> {
    const datos: any = { urgencia };
    if (nivelUrgencia) datos.nivelUrgencia = nivelUrgencia;
    return this.http.patch<any>(`${this.API_URL}/${id}`, datos);
  }

  // ==================== OPERACIONES DE ELIMINACIÓN ====================

  /**
   * Elimina una solicitud por ID
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`);
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Calcula estadísticas de solicitudes
   */
  obtenerEstadisticas(): Observable<{
    total: number;
    porEstado: Record<string, number>;
    urgentes: number;
    porcentajeUrgentes: number;
  }> {
    return this.SolicitudesobtenerTodas().pipe(
      map(solicitudes => {
        const total = solicitudes.length;
        
        return {
          total,
          porEstado: this.calcularConteoPorCampo(solicitudes, 'estado'),
          urgentes: solicitudes.filter(s => s.urgencia).length,
          porcentajeUrgentes: total > 0 ? (solicitudes.filter(s => s.urgencia).length / total) * 100 : 0
        };
      })
    );
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Aplica múltiples filtros a una lista de solicitudes
   */
  private aplicarFiltros(solicitudes: any[], filtros: any): any[] {
    return solicitudes.filter(s => {
      // Filtro por ID de cliente
      if (filtros.clienteId && s.cliente_id !== filtros.clienteId) return false;
      
      // Filtro por ID de profesional
      if (filtros.profesionalId && s.profesional_id !== filtros.profesionalId) return false;
      
      // Filtro por ID de servicio
      if (filtros.servicioId && s.servicio_id !== filtros.servicioId) return false;
      
      // Filtro por estado exacto
      if (filtros.estado && s.estado !== filtros.estado) return false;
      
      // Filtro por estado de urgencia
      if (filtros.urgente !== undefined && s.urgencia !== filtros.urgente) return false;
      
      // Filtro por texto de búsqueda (descripción, ubicación o estado)
      if (filtros.busqueda) {
        const textoBusqueda = filtros.busqueda.toLowerCase();
        const textoMatch = 
          s.descripcion?.toLowerCase().includes(textoBusqueda) ||
          s.ubicacion?.toLowerCase().includes(textoBusqueda) ||
          s.estado?.toLowerCase().includes(textoBusqueda);
        if (!textoMatch) return false;
      }
      
      // Filtro por rango de fechas
      if (filtros.fechaInicio || filtros.fechaFin) {
        const fechaSolicitud = new Date(s.fecha);
        if (filtros.fechaInicio && fechaSolicitud < filtros.fechaInicio) return false;
        if (filtros.fechaFin && fechaSolicitud > filtros.fechaFin) return false;
      }
      
      return true;
    });
  }

  /**
   * Calcula el conteo de items por un campo específico
   */
  private calcularConteoPorCampo(lista: any[], campo: string): Record<string, number> {
    return lista.reduce((acc, item) => {
      const valor = item[campo];
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}