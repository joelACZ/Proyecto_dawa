import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';

import { SolicitudService } from '../../services/solicitud-service';
import { ServClientesAPI } from '../../services/cliente-service-API';
import { ServResenaAPI } from '../../services/resena-service-API';
import { ServServicioAPI } from '../../services/servicio-service-API';
import { ServProfesionalAPI } from '../../services/profesionales-service-API';
import { ServSolicitudAPI } from '../../services/solicitud-service-API';

@Component({
  selector: 'app-resena-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './resena-list.html',
  styleUrls: ['./resena-list.css']
})
export class ResenaListComponent implements OnInit {
  resenas: any[] = [];
  clientes: any[] = [];
  profesionales: any[] = [];
  servicios: any[] = [];
  cargando = false;

constructor(
    private servicioResenas: ServResenaAPI,
    private servicioClientes: ServClientesAPI,
    private servicioProfesionales: ServProfesionalAPI,
    private servicioServicios: ServServicioAPI,
    private solicitudService: ServSolicitudAPI, // Centralizado
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarComponente();
  }
  
  private async inicializarComponente(): Promise<void> {
    this.cargando = true;
    console.log('Iniciando carga de datos...');
    
    try {

      const data = await firstValueFrom(
        forkJoin({
          clientes: this.servicioClientes.obtenerTodos(),
          profesionales: this.servicioProfesionales.obtenerTodos(),
          servicios: this.servicioServicios.obtenerTodos(),
          resenas: this.servicioResenas.obtenerTodas(),
          solicitudes: this.solicitudService.obtenerTodas()
        })
      );

    
      console.log(' Clientes cargados:', data.clientes?.length || 0, data.clientes);
      console.log(' Profesionales cargados:', data.profesionales?.length || 0, data.profesionales);
      console.log(' Servicios cargados:', data.servicios?.length || 0, data.servicios);
      console.log(' Reseñas cargadas:', data.resenas?.length || 0, data.resenas);
      console.log(' Solicitudes cargadas:', data.solicitudes?.length || 0, data.solicitudes);

      
      this.clientes = data.clientes || [];
      this.profesionales = data.profesionales || [];
      this.servicios = data.servicios || [];

      
      this.enriquecerResenas(data.resenas || [], data.solicitudes || []);
      
      console.log(' Reseñas enriquecidas:', this.resenas.length, this.resenas);

    } catch (error) {
      console.error(' Error en la inicialización:', error);
      this.mostrarMensaje('Error al inicializar componente: ' + error, 'error');
      this.resenas = [];
    } finally {
      this.cargando = false;
      console.log(' Carga finalizada. Reseñas:', this.resenas.length);
    }
  }

  private enriquecerResenas(resenas: any[], solicitudes: any[]): void {
    console.log(' Enriqueciendo reseñas...');
    
    
    const solicitudesMap = new Map(solicitudes.map(s => [String(s.id), s]));
    console.log(' Mapa de solicitudes creado:', solicitudesMap.size);

    this.resenas = resenas.map((resena, index) => {
      
      if (index === 0) {
        console.log(' Ejemplo de reseña original:', resena);
        console.log(' Claves disponibles en reseña:', Object.keys(resena));
      }

      
      let solicitudId = resena.solicitud_id ?? resena.solicitudId ?? 
                        resena.id_solicitud ?? resena.idSolicitud ?? 
                        resena.SolicitudId;
      
      
      solicitudId = String(solicitudId);
      
      if (index === 0) {
        console.log(' solicitudId después de conversión:', solicitudId, 'Tipo:', typeof solicitudId);
      }
      
      const solicitud = solicitudesMap.get(solicitudId);
      
      if (!solicitud) {
        if (index === 0) {
          console.warn(' No se encontró solicitud para ID:', solicitudId);
          console.warn(' IDs disponibles en solicitudes:', Array.from(solicitudesMap.keys()));
          console.warn(' Primera solicitud de ejemplo:', solicitudes[0]);
        }
      } else {
        if (index === 0) {
          console.log(' Solicitud encontrada:', solicitud);
        }
      }

      
      const cliente = solicitud ? this.clientes.find(c => String(c.id) === String(solicitud.cliente_id)) : null;
      const profesional = solicitud ? this.profesionales.find(p => String(p.id) === String(solicitud.profesional_id)) : null;
      const servicio = solicitud ? this.servicios.find(s => String(s.id) === String(solicitud.servicio_id)) : null;

      
      if (index === 0 && solicitud) {
        console.log('Buscando profesional_id:', solicitud.profesional_id, 'Tipo:', typeof solicitud.profesional_id);
        console.log('Profesionales disponibles (primeros 3):', this.profesionales.slice(0, 3));
        console.log('Profesional encontrado:', profesional);
        
        console.log('Buscando servicio_id:', solicitud.servicio_id, 'Tipo:', typeof solicitud.servicio_id);
        console.log('Servicios disponibles (primeros 3):', this.servicios.slice(0, 3));
        console.log('Servicio encontrado:', servicio);
      }

      const enriquecida = {
        ...resena,
        nombreCliente: cliente?.nombre || 'Cliente desconocido',
        profesionalNombre: profesional?.nombre || 'Profesional no asignado',
        servicioDescripcion: servicio?.nombre || solicitud?.descripcion || 'Sin descripción',
        anonima: resena.anonima ?? false
      };

      if (index === 0) {
        console.log(' Ejemplo de reseña enriquecida:', enriquecida);
      }

      return enriquecida;
    });

    console.log(' Total reseñas enriquecidas:', this.resenas.length);
  }

  volverAlCrud(): void {
    this.router.navigate(['/crud-resenas']);
  }

  obtenerEstrellas(calificacion: number): string {
    return '⭐'.repeat(calificacion);
  }

  formatearFecha(fecha: Date | string): string {
    const fechaObj = new Date(fecha);
    return isNaN(fechaObj.getTime()) ? 'Fecha inválida' : fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return '??';
    const palabras = nombre.trim().split(' ').filter(p => p);
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  buscarResena(termino: string): void {
    console.log(' Buscando reseña:', termino);

  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning'): void {
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);

  }
}