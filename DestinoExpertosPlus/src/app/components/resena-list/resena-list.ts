import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // ← IMPORTANTE
import { Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { ServResenasJson } from '../../services/resena-service';
import { ServClientesJson } from '../../services/cliente-service';
import { ServServiciosJson } from '../../services/servicio-service';
import { ServProfesionalesJson } from '../../services/profesionales-service';
import { SolicitudService } from '../../services/solicitud-service';

@Component({
  selector: 'app-resena-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // ← HttpClientModule agregado
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
    private servResenas: ServResenasJson,
    private servicioClientes: ServClientesJson,
    private servicioProfesionales: ServProfesionalesJson,
    private servicioServicios: ServServiciosJson,
    private solicitudService: SolicitudService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('🚀 ngOnInit ejecutado');
    this.inicializarComponente();
  }

  // MÉTODO MEJORADO: Usa forkJoin para cargar todo en paralelo
  private async inicializarComponente(): Promise<void> {
    this.cargando = true;
    console.log('⏳ Iniciando carga de datos...');
    
    try {
      // Carga TODO en paralelo con forkJoin (más eficiente)
      const data = await firstValueFrom(
        forkJoin({
          clientes: this.servicioClientes.obtenerTodos(),
          profesionales: this.servicioProfesionales.obtenerTodos(),
          servicios: this.servicioServicios.obtenerTodos(),
          resenas: this.servResenas.obtenerTodas(),
          solicitudes: this.solicitudService.obtenerTodas()
        })
      );

      // Logs de diagnóstico
      console.log('✅ Clientes cargados:', data.clientes?.length || 0, data.clientes);
      console.log('✅ Profesionales cargados:', data.profesionales?.length || 0, data.profesionales);
      console.log('✅ Servicios cargados:', data.servicios?.length || 0, data.servicios);
      console.log('✅ Reseñas cargadas:', data.resenas?.length || 0, data.resenas);
      console.log('✅ Solicitudes cargadas:', data.solicitudes?.length || 0, data.solicitudes);

      // Asignar datos
      this.clientes = data.clientes || [];
      this.profesionales = data.profesionales || [];
      this.servicios = data.servicios || [];

      // Enriquecer reseñas
      this.enriquecerResenas(data.resenas || [], data.solicitudes || []);
      
      console.log('🎉 Reseñas enriquecidas:', this.resenas.length, this.resenas);

    } catch (error) {
      console.error('❌ Error en la inicialización:', error);
      this.mostrarMensaje('Error al inicializar componente: ' + error, 'error');
      this.resenas = [];
    } finally {
      this.cargando = false;
      console.log('✅ Carga finalizada. Reseñas:', this.resenas.length);
    }
  }

  private enriquecerResenas(resenas: any[], solicitudes: any[]): void {
    console.log('🔄 Enriqueciendo reseñas...');
    
    // Crear mapa de solicitudes (convertir IDs a string para evitar problemas de tipo)
    const solicitudesMap = new Map(solicitudes.map(s => [String(s.id), s]));
    console.log('📋 Mapa de solicitudes creado:', solicitudesMap.size);

    this.resenas = resenas.map((resena, index) => {
      // Log de cada reseña para diagnóstico
      if (index === 0) {
        console.log('🔍 Ejemplo de reseña original:', resena);
        console.log('🔑 Claves disponibles en reseña:', Object.keys(resena));
      }

      // OBTENER el ID de la solicitud (probar diferentes nombres de clave)
      let solicitudId = resena.solicitud_id ?? resena.solicitudId ?? 
                        resena.id_solicitud ?? resena.idSolicitud ?? 
                        resena.SolicitudId;
      
      // CONVERTIR a string para buscar en el Map
      solicitudId = String(solicitudId);
      
      if (index === 0) {
        console.log('🔑 solicitudId después de conversión:', solicitudId, 'Tipo:', typeof solicitudId);
      }
      
      const solicitud = solicitudesMap.get(solicitudId);
      
      if (!solicitud) {
        if (index === 0) {
          console.warn('⚠️ No se encontró solicitud para ID:', solicitudId);
          console.warn('⚠️ IDs disponibles en solicitudes:', Array.from(solicitudesMap.keys()));
          console.warn('⚠️ Primera solicitud de ejemplo:', solicitudes[0]);
        }
      } else {
        if (index === 0) {
          console.log('✅ Solicitud encontrada:', solicitud);
        }
      }

      // Buscar cliente, profesional y servicio
      const cliente = solicitud ? this.clientes.find(c => String(c.id) === String(solicitud.cliente_id)) : null;
      const profesional = solicitud ? this.profesionales.find(p => String(p.id) === String(solicitud.profesional_id)) : null;
      const servicio = solicitud ? this.servicios.find(s => String(s.id) === String(solicitud.servicio_id)) : null;

      // Log detallado si es la primera reseña
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
        // Asegurar que anonima tenga un valor por defecto
        anonima: resena.anonima ?? false
      };

      if (index === 0) {
        console.log('✨ Ejemplo de reseña enriquecida:', enriquecida);
      }

      return enriquecida;
    });

    console.log('✅ Total reseñas enriquecidas:', this.resenas.length);
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
    console.log('🔍 Buscando reseña:', termino);
    // TODO: Implementar búsqueda
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning'): void {
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    // TODO: Implementar toast/notificación visual
  }
}