import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private readonly API_URL = 'http://localhost:3000/solicitudes';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las solicitudes sin filtrar
   * @returns Observable<any[]> - Listado completo de solicitudes
   */
  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  /**
   * Obtiene una solicitud específica por ID
   * @param id - Identificador numérico de la solicitud
   * @returns Observable<any> - Datos de la solicitud encontrada
   */
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene solicitudes aplicando múltiples filtros simultáneamente
   * @param filtros - Objeto con propiedades opcionales: busqueda, estado, urgente, clienteId, profesionalId, servicioId, fechaInicio, fechaFin
   * @returns Observable<any[]> - Listado filtrado de solicitudes
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

  /**
   * Crea una nueva solicitud asignando fecha actual automáticamente
   * @param datosSolicitud - Datos parciales de la solicitud (estado por defecto: 'pendiente')
   * @returns Observable<any> - Solicitud creada con fecha y estado asignados
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
   * @param id - Identificador numérico de la solicitud
   * @param datosSolicitud - Datos completos actualizados de la solicitud
   * @returns Observable<any> - Solicitud actualizada
   */
  actualizar(id: number, datosSolicitud: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, datosSolicitud);
  }

  /**
   * Actualiza solo el estado de una solicitud
   * @param id - Identificador numérico de la solicitud
   * @param estado - Nuevo estado a asignar
   * @returns Observable<any> - Resultado de la actualización parcial
   */
  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/${id}`, { estado });
  }

  /**
   * Actualiza solo la configuración de urgencia
   * @param id - Identificador numérico de la solicitud
   * @param urgencia - Indicador de urgencia (true/false)
   * @param nivelUrgencia - Nivel de urgencia opcional (alto, medio, bajo)
   * @returns Observable<any> - Resultado de la actualización parcial
   */
  actualizarUrgencia(id: number, urgencia: boolean, nivelUrgencia?: string): Observable<any> {
    const datos: any = { urgencia };
    if (nivelUrgencia) datos.nivelUrgencia = nivelUrgencia;
    return this.http.patch<any>(`${this.API_URL}/${id}`, datos);
  }

  /**
   * Elimina una solicitud por ID
   * @param id - Identificador numérico de la solicitud a eliminar
   * @returns Observable<any> - Resultado de la operación de eliminación
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`);
  }

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
}

