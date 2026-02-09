import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';

// Servicios API
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
  // Arreglo principal que usará el HTML
  resenas: any[] = [];
  
  // Estados de carga
  cargando = false;

  // Datos de referencia para el cruce
  private clientes: any[] = [];
  private profesionales: any[] = [];
  private servicios: any[] = [];

  constructor(
    private servicioResenas: ServResenaAPI,
    private servicioClientes: ServClientesAPI,
    private servicioProfesionales: ServProfesionalAPI,
    private servicioServicios: ServServicioAPI,
    private solicitudService: ServSolicitudAPI,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  /**
   * Carga masiva de datos y procesamiento inicial
   */
  private async inicializarComponente(): Promise<void> {
    this.cargando = true;
    
    try {
      // Cargamos todas las fuentes de datos en paralelo
      const data = await firstValueFrom(
        forkJoin({
          clientes: this.servicioClientes.obtenerTodos(),
          profesionales: this.servicioProfesionales.obtenerTodos(),
          servicios: this.servicioServicios.obtenerTodos(),
          resenas: this.servicioResenas.obtenerTodas(),
          solicitudes: this.solicitudService.obtenerTodas()
        })
      );

      // Guardamos referencias para métodos auxiliares
      this.clientes = data.clientes || [];
      this.profesionales = data.profesionales || [];
      this.servicios = data.servicios || [];

      // Procesamos las reseñas para añadirles los nombres reales
      this.enriquecerResenas(data.resenas || [], data.solicitudes || []);

    } catch (error) {
      console.error('Error al cargar datos en ResenaList:', error);
      this.resenas = [];
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Realiza el "JOIN" manual entre Reseñas -> Solicitudes -> Clientes/Profesionales
   */
  private enriquecerResenas(resenasRaw: any[], solicitudes: any[]): void {
  // 1. Mapas con normalización de IDs (convertimos todo a String para evitar fallos de tipo)
  const solicitudesMap = new Map(solicitudes.map(s => [String(s.id || s.Id), s]));
  const clientesMap = new Map(this.clientes.map(c => [String(c.id || c.Id), c]));
  const profesionalesMap = new Map(this.profesionales.map(p => [String(p.id || p.Id), p]));
  const serviciosMap = new Map(this.servicios.map(s => [String(s.id || s.Id), s]));

  this.resenas = resenasRaw.map(resena => {
    // Buscamos el ID de la solicitud en la reseña (probando varios nombres)
    const solicitudId = String(resena.solicitud_id || resena.solicitudId || resena.idSolicitud || resena.SolicitudId || '');
    const solicitud = solicitudesMap.get(solicitudId);

    // LOG DE DEPURACIÓN (Solo para la primera reseña para no saturar la consola)
    // Descomenta la línea de abajo si el error persiste para ver qué llega en 'solicitud'
    // if (solicitud) console.log('Solicitud encontrada:', solicitud);

    // Intentamos obtener el profesionalId de la SOLICITUD o de la RESEÑA directamente
    const profesionalId = String(
      solicitud?.profesional_id || 
      solicitud?.profesionalId || 
      solicitud?.ProfesionalId || 
      resena.profesional_id || 
      resena.profesionalId || 
      ''
    );

    // Intentamos obtener el clienteId
    const clienteId = String(
      solicitud?.cliente_id || 
      solicitud?.clienteId || 
      resena.cliente_id || 
      resena.clienteId || 
      ''
    );

    // Intentamos obtener el servicioId
    const servicioId = String(
      solicitud?.servicio_id || 
      solicitud?.servicioId || 
      resena.servicio_id || 
      resena.servicioId || 
      ''
    );

    const cliente = clientesMap.get(clienteId);
    const profesional = profesionalesMap.get(profesionalId);
    const servicio = serviciosMap.get(servicioId);

    return {
      ...resena,
      nombreCliente: cliente?.nombre || cliente?.Nombre || 'Cliente no identificado',
      profesionalNombre: profesional?.nombre || profesional?.Nombre || 'Profesional no asignado',
      servicioDescripcion: servicio?.nombre || servicio?.Nombre || solicitud?.descripcion || 'Servicio General',
      fecha: resena.fecha ? new Date(resena.fecha) : new Date(),
      calificacion: Number(resena.calificacion) || 0,
      anonima: resena.anonima === true || resena.anonima === 'true'
    };
  });
}

  // --- Métodos de Ayuda para el HTML ---

  obtenerEstrellas(calificacion: number): string {
    return '⭐'.repeat(Math.max(0, Math.min(5, calificacion)));
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre || nombre === 'Cliente no identificado') return '??';
    return nombre.split(' ')
                 .map(p => p[0])
                 .join('')
                 .substring(0, 2)
                 .toUpperCase();
  }

  formatearFecha(fecha: any): string {
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? 'S/F' : d.toLocaleDateString('es-ES');
  }

  buscarResena(termino: string): void {
    if (!termino) {
      this.inicializarComponente(); // Recargar si se limpia el buscador
      return;
    }
    const t = termino.toLowerCase();
    this.resenas = this.resenas.filter(r => 
      r.comentario?.toLowerCase().includes(t) || 
      r.nombreCliente?.toLowerCase().includes(t) ||
      r.profesionalNombre?.toLowerCase().includes(t)
    );
  }

  volverAlCrud(): void {
    this.router.navigate(['/crud-resenas']);
  }
}