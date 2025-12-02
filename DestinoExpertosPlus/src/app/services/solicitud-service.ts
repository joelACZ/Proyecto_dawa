import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Solicitud, SolicitudCreate, SolicitudUpdate } from '../models/Solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private solicitudesUrl = 'http://localhost:3000/solicitudes';

  constructor(private http: HttpClient) {}

  // GET: obtener todas las solicitudes
  getSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl);
  }

  // GET: obtener solicitud por ID
  getSolicitudById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.solicitudesUrl}/${id}`);
  }

  // GET: obtener solicitudes por cliente
  getSolicitudesByCliente(clienteId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes => 
        solicitudes.filter(s => s.cliente_id === clienteId)
      )
    );
  }

  // GET: obtener solicitudes por profesional
  getSolicitudesByProfesional(profesionalId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes => 
        solicitudes.filter(s => s.profesional_id === profesionalId)
      )
    );
  }

  // GET: obtener solicitudes por servicio
  getSolicitudesByServicio(servicioId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes => 
        solicitudes.filter(s => s.servicio_id === servicioId)
      )
    );
  }

  // SEARCH: filtrar solicitudes por descripción, ubicación o estado
  searchSolicitudes(param: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes =>
        solicitudes.filter(s =>
          s.descripcion.toLowerCase().includes(param.toLowerCase()) ||
          s.ubicacion.toLowerCase().includes(param.toLowerCase()) ||
          s.estado.toLowerCase().includes(param.toLowerCase())
        )
      )
    );
  }

  // POST: crear nueva solicitud
  create(solicitud: SolicitudCreate): Observable<Solicitud> {
    // Asignar fecha actual si no viene en la solicitud
    const solicitudConFecha = {
      ...solicitud,
      fecha: new Date().toISOString()
    };
    return this.http.post<Solicitud>(this.solicitudesUrl, solicitudConFecha);
  }

  // PUT: actualizar solicitud existente
  update(id: number, solicitud: SolicitudUpdate): Observable<Solicitud> {
    const url = `${this.solicitudesUrl}/${id}`;
    return this.http.put<Solicitud>(url, solicitud);
  }

  // PATCH: actualizar parcialmente (especialmente útil para estados)
  updateEstado(id: number, estado: string): Observable<Solicitud> {
    const url = `${this.solicitudesUrl}/${id}`;
    return this.http.patch<Solicitud>(url, { estado });
  }

  // PATCH: actualizar urgencia
  updateUrgencia(id: number, urgencia: boolean, nivelUrgencia?: string): Observable<Solicitud> {
    const url = `${this.solicitudesUrl}/${id}`;
    const updateData: any = { urgencia };
    if (nivelUrgencia) {
      updateData.nivelUrgencia = nivelUrgencia;
    }
    return this.http.patch<Solicitud>(url, updateData);
  }

  // DELETE: eliminar solicitud
  delete(id: number): Observable<Solicitud> {
    const url = `${this.solicitudesUrl}/${id}`;
    return this.http.delete<Solicitud>(url);
  }

  // Métodos adicionales útiles

  // Filtrar por estado
  getSolicitudesByEstado(estado: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes => 
        solicitudes.filter(s => s.estado === estado)
      )
    );
  }

  // Filtrar por urgencia
  getSolicitudesUrgentes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes => 
        solicitudes.filter(s => s.urgencia === true)
      )
    );
  }

  // Obtener solicitudes por rango de fechas
  getSolicitudesByFechaRange(fechaInicio: Date, fechaFin: Date): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes =>
        solicitudes.filter(s => {
          const fechaSolicitud = new Date(s.fecha);
          return fechaSolicitud >= fechaInicio && fechaSolicitud <= fechaFin;
        })
      )
    );
  }

  // Obtener estadísticas de solicitudes
  getEstadisticas(): Observable<any> {
    return this.http.get<Solicitud[]>(this.solicitudesUrl).pipe(
      map(solicitudes => {
        const total = solicitudes.length;
        const porEstado = solicitudes.reduce((acc, s) => {
          acc[s.estado] = (acc[s.estado] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const urgentes = solicitudes.filter(s => s.urgencia).length;
        const conNivelUrgencia = solicitudes.filter(s => s.nivelUrgencia).length;

        return {
          total,
          porEstado,
          urgentes,
          conNivelUrgencia,
          porcentajeUrgentes: total > 0 ? (urgentes / total) * 100 : 0
        };
      })
    );
  }
}