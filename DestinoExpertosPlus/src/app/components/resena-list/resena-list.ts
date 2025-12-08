import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServResenasJson } from '../../services/resena-service';
import { ServClientesJson } from '../../services/cliente-service';
import { SolicitudService } from '../../services/solicitud-service';
import { ServProfesionalesJson } from '../../services/profesionales-service';
import { Resena } from '../../models/Resena.model';

interface ResenaConDetalles extends Resena {
  nombreCliente?: string;
  descripcionSolicitud?: string;
}

@Component({
  selector: 'app-resena-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resena-list.html',
  styleUrls: ['./resena-list.css']
  
})
export class ResenaListComponent implements OnInit {
  resenas: ResenaConDetalles[] = [];
  cargando: boolean = true;

  constructor(
    private servResenas: ServResenasJson,
    private servicioClientes: ServClientesJson,
    private solicitudService: SolicitudService,
    private servicioProfesionales: ServProfesionalesJson,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarResenas();
  }

  cargarResenas(): void {
    this.cargando = true;

    // Cargar todas las reseñas
    this.servResenas.obtenerTodas().subscribe({
      next: (resenas) => {
        // Cargar clientes y solicitudes para obtener nombres
        this.servicioClientes.obtenerTodos().subscribe({
          next: (clientes) => {
            this.solicitudService.obtenerTodas().subscribe({
              next: (solicitudes) => {
                // Enriquecer las reseñas con información adicional
                this.resenas = resenas.map(resena => {
                  const solicitud = solicitudes.find(s => s.id === resena.solicitud_id);
                  const cliente = solicitud ? clientes.find(c => c.id === solicitud.cliente_id) : null;

                  return {
                    ...resena,
                    nombreCliente: cliente?.nombre || 'Cliente desconocido',
                    descripcionSolicitud: solicitud?.descripcion || 'Sin descripción'
                  };
                });

                this.cargando = false;
              },
              error: () => {
                this.cargando = false;
              }
            });
          }
        });
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  volverAlCrud(): void {
    this.router.navigate(['/crud-resenas']);
  }

  obtenerTextoCalificacion(calificacion: number): string {
    const textos = ['', 'Pésimo servicio', 'Mal servicio', 'Servicio regular', 'Buen servicio', 'Excelente servicio'];
    return textos[calificacion] || '';
  }

  obtenerEstrellas(calificacion: number): string {
    return '⭐'.repeat(calificacion);
  }

  formatearFecha(fecha: Date | string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerIniciales(nombre: string): string {
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return palabras[0][0] + palabras[1][0];
    }
    return nombre.substring(0, 2);
  }

  private inicializarComponente(): void {
    this.cargando = true;

    // Cargar datos maestros y solicitudes en paralelo
    Promise.all([
      this.servicioClientes.obtenerTodos().toPromise(),
      this.servicioProfesionales.obtenerTodos().toPromise(),
      //this.servicioServicios.obtenerTodos().toPromise(),
      //this.cargarSolicitudes()
    ]).finally(() => {
      this.cargando = false;
    });
  }
}