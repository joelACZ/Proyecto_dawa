import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  '@angular/forms';
import { Solicitud, SolicitudCreate, EstadoSolicitud, NivelUrgencia } from '../../models/Solicitud.model';
import { Cliente } from '../../models/Cliente.model';
import { Profesional } from '../../models/Profesional.model';
import { Servicio } from '../../models/Servicio.model';
import { ServServiciosJson } from '../../services/servicio-service';
import { SolicitudService } from '../../services/solicitud-service';
import { ServClientesJson } from '../../services/cliente-service';
import { ServProfesionalesJson } from '../../services/profesionales-service'; // Necesitarás crear este servicio

@Component({
  selector: 'app-crud-solicitudes',
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // SOLO componentes, directivas y pipes - NO servicios
  templateUrl: './crud-solicitudes.html', // Verifica la extensión
  styleUrl: './crud-solicitudes.css',
})
export class CrudSolicitudesComponent implements OnInit {
  // Listas de datos
  solicitudes: Solicitud[] = [];
  clientes: Cliente[] = [];
  profesionales: Profesional[] = [];
  servicios: Servicio[] = [];
  
  // Estados disponibles
  estadosSolicitud: EstadoSolicitud[] = ['pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'];
  nivelesUrgencia: NivelUrgencia[] = ['baja', 'media', 'alta'];
  
  // Objeto para nueva solicitud
  nuevaSolicitud: SolicitudCreate = {
    cliente_id: 0,
    profesional_id: 0,
    servicio_id: 0,
    estado: 'pendiente',
    descripcion: '',
    ubicacion: '',
    urgencia: false,
    nivelUrgencia: undefined
  };
  
  // Solicitud seleccionada para editar
  solicitudSeleccionada: Solicitud | null = null;
  
  // Filtros
  filtroBusqueda: string = '';
  filtroEstado: string = 'todos';
  filtroUrgencia: string = 'todos';
  filtroCliente: number = 0;
  filtroProfesional: number = 0;
  
  // Control de UI
  modoEdicion: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';
  
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;
  
  constructor(
    private solicitudesService: SolicitudService,
    private clientesService: ServClientesJson,
    private profesionalesService: ServProfesionalesJson,
    private serviciosService: ServServiciosJson 
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar todos los datos necesarios
  cargarDatos(): void {
    this.cargando = true;
    
    // Cargar solicitudes
    this.solicitudesService.getSolicitudes().subscribe({
      next: (data: Solicitud[]) => {
        this.solicitudes = data;
        this.calcularPaginacion();
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al cargar las solicitudes', 'error');
        this.cargando = false;
        console.error('Error:', error);
      }
    });
    
    // Cargar clientes para los filtros y formulario
    this.clientesService.getClientes().subscribe({
      next: (data: Cliente[]) => {
        this.clientes = data;
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.mostrarMensaje('Error al cargar clientes', 'error');
      }
    });
    
    // Cargar profesionales - Necesitas implementar este servicio
    this.profesionalesService.getProfesionales().subscribe({
       next: (data: Profesional[]) => {
         this.profesionales = data;
       },
       error: (error: any) => {
         console.error('Error al cargar profesionales:', error);
       }
    });
    
    // Cargar servicios
    this.serviciosService.getServicios().subscribe({
      next: (data: Servicio[]) => {
        this.servicios = data;
      },
      error: (error: any) => {
        console.error('Error al cargar servicios:', error);
        this.mostrarMensaje('Error al cargar servicios', 'error');
      }
    });
  }

  // Aplicar filtros
  get solicitudesFiltradas(): Solicitud[] {
    let filtradas = this.solicitudes;
    
    // Filtro por búsqueda
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      filtradas = filtradas.filter(s =>
        s.descripcion.toLowerCase().includes(busqueda) ||
        s.ubicacion.toLowerCase().includes(busqueda) ||
        s.estado.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      filtradas = filtradas.filter(s => s.estado === this.filtroEstado);
    }
    
    // Filtro por urgencia
    if (this.filtroUrgencia !== 'todos') {
      const esUrgente = this.filtroUrgencia === 'urgente';
      filtradas = filtradas.filter(s => s.urgencia === esUrgente);
    }
    
    // Filtro por cliente
    if (this.filtroCliente > 0) {
      filtradas = filtradas.filter(s => s.cliente_id === this.filtroCliente);
    }
    
    // Filtro por profesional
    if (this.filtroProfesional > 0) {
      filtradas = filtradas.filter(s => s.profesional_id === this.filtroProfesional);
    }
    
    this.calcularPaginacion(filtradas);
    return filtradas;
  }

  // Obtener solicitudes paginadas
  get solicitudesPaginadas(): Solicitud[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.solicitudesFiltradas.slice(inicio, fin);
  }

  calcularPaginacion(lista?: Solicitud[]): void {
    const listaUsar = lista || this.solicitudes;
    this.totalPaginas = Math.ceil(listaUsar.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    }
  }

  // Navegación de páginas
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Crear nueva solicitud
  crearSolicitud(): void {
    if (!this.validarSolicitud()) return;
    
    this.cargando = true;
    this.solicitudesService.create(this.nuevaSolicitud).subscribe({
      next: (solicitud: Solicitud) => {
        this.solicitudes.unshift(solicitud); // Agregar al inicio
        this.resetFormulario();
        this.mostrarMensaje('Solicitud creada exitosamente', 'success');
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al crear la solicitud', 'error');
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  // Seleccionar solicitud para editar
  seleccionarSolicitud(solicitud: Solicitud): void {
    this.solicitudSeleccionada = { ...solicitud };
    this.modoEdicion = true;
    
    // Mapear a la estructura de edición (sin id y fecha)
    this.nuevaSolicitud = {
      cliente_id: solicitud.cliente_id,
      profesional_id: solicitud.profesional_id,
      servicio_id: solicitud.servicio_id,
      estado: solicitud.estado,
      descripcion: solicitud.descripcion,
      ubicacion: solicitud.ubicacion,
      urgencia: solicitud.urgencia,
      nivelUrgencia: solicitud.nivelUrgencia
    };
  }

  // Actualizar solicitud
  actualizarSolicitud(): void {
    if (!this.solicitudSeleccionada || !this.validarSolicitud()) return;
    
    this.cargando = true;
    this.solicitudesService.update(this.solicitudSeleccionada.id, this.nuevaSolicitud).subscribe({
      next: (solicitudActualizada: Solicitud) => {
        const index = this.solicitudes.findIndex(s => s.id === solicitudActualizada.id);
        if (index !== -1) {
          this.solicitudes[index] = solicitudActualizada;
        }
        this.resetFormulario();
        this.mostrarMensaje('Solicitud actualizada exitosamente', 'success');
        this.cargando = false;
      },
      error: (error: any) => {
        this.mostrarMensaje('Error al actualizar la solicitud', 'error');
        this.cargando = false;
        console.error('Error:', error);
      }
    });
  }

  // Eliminar solicitud
  eliminarSolicitud(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) {
      this.cargando = true;
      this.solicitudesService.delete(id).subscribe({
        next: () => {
          this.solicitudes = this.solicitudes.filter(s => s.id !== id);
          this.mostrarMensaje('Solicitud eliminada exitosamente', 'success');
          this.cargando = false;
        },
        error: (error: any) => {
          this.mostrarMensaje('Error al eliminar la solicitud', 'error');
          this.cargando = false;
          console.error('Error:', error);
        }
      });
    }
  }

  // Cambiar estado de la solicitud
  cambiarEstado(solicitud: Solicitud, nuevoEstado: EstadoSolicitud): void {
    // Verifica si tu servicio tiene el método updateEstado
    if ((this.solicitudesService as any).updateEstado) {
      (this.solicitudesService as any).updateEstado(solicitud.id, nuevoEstado).subscribe({
        next: (solicitudActualizada: Solicitud) => {
          const index = this.solicitudes.findIndex(s => s.id === solicitudActualizada.id);
          if (index !== -1) {
            this.solicitudes[index] = solicitudActualizada;
          }
          this.mostrarMensaje(`Estado cambiado a ${nuevoEstado}`, 'success');
        },
        error: (error: any) => {
          this.mostrarMensaje('Error al cambiar el estado', 'error');
          console.error('Error:', error);
        }
      });
    } else {
      // Si no existe updateEstado, usa el update normal
      const solicitudActualizada = { ...solicitud, estado: nuevoEstado };
      this.solicitudesService.update(solicitud.id, solicitudActualizada).subscribe({
        next: (respuesta: Solicitud) => {
          const index = this.solicitudes.findIndex(s => s.id === respuesta.id);
          if (index !== -1) {
            this.solicitudes[index] = respuesta;
          }
          this.mostrarMensaje(`Estado cambiado a ${nuevoEstado}`, 'success');
        },
        error: (error: any) => {
          this.mostrarMensaje('Error al cambiar el estado', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  // Validar formulario
  validarSolicitud(): boolean {
    if (!this.nuevaSolicitud.cliente_id || !this.nuevaSolicitud.profesional_id || 
        !this.nuevaSolicitud.servicio_id || !this.nuevaSolicitud.descripcion.trim() || 
        !this.nuevaSolicitud.ubicacion.trim()) {
      this.mostrarMensaje('Por favor completa todos los campos obligatorios', 'error');
      return false;
    }
    
    if (this.nuevaSolicitud.urgencia && !this.nuevaSolicitud.nivelUrgencia) {
      this.mostrarMensaje('Si la solicitud es urgente, selecciona un nivel de urgencia', 'error');
      return false;
    }
    
    return true;
  }

  // Resetear formulario
  resetFormulario(): void {
    this.nuevaSolicitud = {
      cliente_id: 0,
      profesional_id: 0,
      servicio_id: 0,
      estado: 'pendiente',
      descripcion: '',
      ubicacion: '',
      urgencia: false,
      nivelUrgencia: undefined
    };
    this.solicitudSeleccionada = null;
    this.modoEdicion = false;
  }

  // Mostrar mensajes
  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  // Formatear fecha
  formatearFecha(fecha: string | Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener clase CSS según estado
  getClaseEstado(estado: EstadoSolicitud): string {
    const clases = {
      'pendiente': 'badge bg-warning',
      'confirmada': 'badge bg-info',
      'en_proceso': 'badge bg-primary',
      'completada': 'badge bg-success',
      'cancelada': 'badge bg-danger'
    };
    return clases[estado] || 'badge bg-secondary';
  }

  // Obtener clase CSS según nivel de urgencia
  getClaseUrgencia(nivel: NivelUrgencia): string {
    const clases = {
      'baja': 'badge bg-info',
      'media': 'badge bg-warning',
      'alta': 'badge bg-danger'
    };
    return clases[nivel] || 'badge bg-secondary';
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = 'todos';
    this.filtroUrgencia = 'todos';
    this.filtroCliente = 0;
    this.filtroProfesional = 0;
    this.paginaActual = 1;
  }

  // Alternar urgencia
  toggleUrgencia(): void {
    if (!this.nuevaSolicitud.urgencia) {
      this.nuevaSolicitud.nivelUrgencia = 'media'; // Valor por defecto
    } else {
      this.nuevaSolicitud.nivelUrgencia = undefined;
    }
  }

  // Métodos auxiliares para obtener nombres
  getClienteNombre(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : `Cliente ${clienteId}`;
  }

  getServicioNombre(servicioId: number): string {
    const servicio = this.servicios.find(s => s.id === servicioId);
    return servicio ? servicio.nombre : `Servicio ${servicioId}`;
  }

  getProfesionalNombre(profesionalId: number): string {
    const profesional = this.profesionales.find(p => p.id === profesionalId);
    return profesional ? profesional.nombre : `Profesional ${profesionalId}`;
  }
}