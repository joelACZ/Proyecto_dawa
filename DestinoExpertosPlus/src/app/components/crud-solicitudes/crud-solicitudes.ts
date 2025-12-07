import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud-service';
import { ServClientesJson } from '../../services/cliente-service';
import { ServProfesionalesJson } from '../../services/profesionales-service';
import { ServServiciosJson } from '../../services/servicio-service';

@Component({
  selector: 'app-crud-solicitudes',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crud-solicitudes.html',
  styleUrl: './crud-solicitudes.css',
})
export class CrudSolicitudesComponent implements OnInit {
  // ==================== PROPIEDADES DE DATOS (sin tipos de modelo) ====================
  solicitudes: any[] = [];
  clientes: any[] = [];
  profesionales: any[] = [];
  servicios: any[] = [];

  // ==================== PROPIEDADES DE FILTROS ====================
  filtros = {
    busqueda: '',
    estado: 'todos',
    urgencia: 'todos',
    clienteId: 0,
    profesionalId: 0
  };

  // ==================== DATOS DEL FORMULARIO ====================
  formulario: {
    cliente_id: number;
    profesional_id: number;
    servicio_id: number;
    estado: string;
    descripcion: string;
    ubicacion: string;
    urgencia: boolean;
    nivelUrgencia?: string;
  } = {
      cliente_id: 0,
      profesional_id: 0,
      servicio_id: 0,
      estado: 'pendiente',
      descripcion: '',
      ubicacion: '',
      urgencia: false,
      nivelUrgencia: undefined
    };

  // ==================== ESTADO DE UI ====================
  modoEdicion = false;
  cargando = false;
  mensaje: { texto: string; tipo: 'success' | 'error' | 'info' } | null = null;

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;
  totalItems = 0;

  // ID para edición
  protected idEditando: number | null = null;

  // ==================== CONSTRUCTOR ====================
  constructor(
    private servicioSolicitudes: SolicitudService,
    private servicioClientes: ServClientesJson,
    private servicioProfesionales: ServProfesionalesJson,
    private servicioServicios: ServServiciosJson
  ) { }

  // ==================== CICLO DE VIDA ====================
  ngOnInit(): void {
    this.inicializarComponente();
  }

  // ==================== INICIALIZACIÓN ====================
  private inicializarComponente(): void {
    this.cargando = true;

    // Cargar datos maestros y solicitudes en paralelo
    Promise.all([
      this.servicioClientes.obtenerTodos().toPromise(),
      this.servicioProfesionales.obtenerTodos().toPromise(),
      this.servicioServicios.getServicios().toPromise(),
      this.cargarSolicitudes()
    ]).finally(() => {
      this.cargando = false;
    });
  }

  private async cargarSolicitudes(): Promise<void> {
    try {
      const respuesta = await this.servicioSolicitudes.obtenerPaginadas(
        this.paginaActual,
        this.itemsPorPagina,
        this.construirFiltros()
      ).toPromise();

      this.solicitudes = respuesta?.datos || [];
      this.totalItems = respuesta?.total || 0;
      this.totalPaginas = respuesta?.totalPaginas || 1;
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      this.mostrarMensaje('Error al cargar solicitudes', 'error');
    }
  }

  // ==================== FILTROS ====================
  aplicarFiltros(): void {
    this.paginaActual = 1; // Resetear paginación
    this.cargarSolicitudes();
  }

  private construirFiltros(): any {
    const params: any = {};

    if (this.filtros.busqueda) params.busqueda = this.filtros.busqueda;
    if (this.filtros.estado !== 'todos') params.estado = this.filtros.estado;
    if (this.filtros.urgencia !== 'todos') params.urgente = this.filtros.urgencia === 'urgente';
    if (this.filtros.clienteId > 0) params.clienteId = this.filtros.clienteId;
    if (this.filtros.profesionalId > 0) params.profesionalId = this.filtros.profesionalId;

    return params;
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      estado: 'todos',
      urgencia: 'todos',
      clienteId: 0,
      profesionalId: 0
    };
    this.aplicarFiltros();
  }

  // ==================== PAGINACIÓN ====================
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;

    this.paginaActual = pagina;
    this.cargarSolicitudes();
  }

  // ==================== OPERACIONES CRUD ====================
  crearSolicitud(): void {
    if (!this.validarFormulario()) return;

    this.cargando = true;
    this.servicioSolicitudes.crear(this.formulario).subscribe({
      next: (nueva) => {
        this.solicitudes.unshift(nueva);
        this.resetearFormulario();
        this.mostrarMensaje('Solicitud creada exitosamente', 'success');
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error creando:', e);
        this.mostrarMensaje('Error al crear solicitud', 'error');
        this.cargando = false;
      }
    });
  }

  prepararEdicion(solicitud: any): void {
    this.idEditando = solicitud.id;
    this.modoEdicion = true;
    Object.assign(this.formulario, solicitud);
  }

  actualizarSolicitud(): void {
    if (!this.idEditando || !this.validarFormulario()) return;

    this.cargando = true;
    this.servicioSolicitudes.actualizar(this.idEditando, this.formulario).subscribe({
      next: (actualizada) => {
        const index = this.solicitudes.findIndex(s => s.id === actualizada.id);
        if (index !== -1) this.solicitudes[index] = actualizada;

        this.resetearFormulario();
        this.mostrarMensaje('Solicitud actualizada exitosamente', 'success');
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error actualizando:', e);
        this.mostrarMensaje('Error al actualizar solicitud', 'error');
        this.cargando = false;
      }
    });
  }

  eliminarSolicitud(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;

    this.cargando = true;
    this.servicioSolicitudes.eliminar(id).subscribe({
      next: () => {
        this.solicitudes = this.solicitudes.filter(s => s.id !== id);
        this.mostrarMensaje('Solicitud eliminada exitosamente', 'success');
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error eliminando:', e);
        this.mostrarMensaje('Error al eliminar solicitud', 'error');
        this.cargando = false;
      }
    });
  }

  // ==================== ACCIONES RÁPIDAS ====================
  cambiarEstado(solicitud: any, nuevoEstado: string): void {
    this.servicioSolicitudes.actualizarEstado(solicitud.id, nuevoEstado).subscribe({
      next: (actualizada) => {
        const index = this.solicitudes.findIndex(s => s.id === actualizada.id);
        if (index !== -1) this.solicitudes[index] = actualizada;
        this.mostrarMensaje(`Estado cambiado a ${nuevoEstado}`, 'success');
      },
      error: (e) => {
        console.error('Error cambiando estado:', e);
        this.mostrarMensaje('Error al cambiar estado', 'error');
      }
    });
  }

  // ==================== VALIDACIÓN Y RESET ====================
  private validarFormulario(): boolean {
    const f = this.formulario;

    if (!f.cliente_id || !f.profesional_id || !f.servicio_id ||
      !f.descripcion?.trim() || !f.ubicacion?.trim()) {
      this.mostrarMensaje('Complete todos los campos obligatorios', 'error');
      return false;
    }

    if (f.urgencia && !f.nivelUrgencia) {
      this.mostrarMensaje('Seleccione nivel de urgencia', 'error');
      return false;
    }

    return true;
  }

  public resetearFormulario(): void {
    this.formulario = {
      cliente_id: 0,
      profesional_id: 0,
      servicio_id: 0,
      estado: 'pendiente',
      descripcion: '',
      ubicacion: '',
      urgencia: false,
      nivelUrgencia: undefined
    };
    this.idEditando = null;
    this.modoEdicion = false;
  }

  // ==================== UTILIDADES ====================
  private mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = { texto, tipo };
    setTimeout(() => this.mensaje = null, 5000);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerClaseEstado(estado: string): string {
    const clases = {
      'pendiente': 'badge bg-warning',
      'confirmada': 'badge bg-info',
      'en_proceso': 'badge bg-primary',
      'completada': 'badge bg-success',
      'cancelada': 'badge bg-danger'
    };
    return clases[estado as keyof typeof clases] || 'badge bg-secondary';
  }

  obtenerClaseUrgencia(nivel: string): string {
    const clases = {
      'baja': 'badge bg-info',
      'media': 'badge bg-warning',
      'alta': 'badge bg-danger'
    };
    return clases[nivel as keyof typeof clases] || 'badge bg-secondary';
  }

  // ==================== MÉTODOS AUXILIARES PARA TEMPLATE ====================
  toggleUrgencia(): void {
    this.formulario.nivelUrgencia = this.formulario.urgencia ? 'media' : undefined;
  }

  obtenerNombreCliente(id: number): string {
    return this.clientes.find(c => c.id === id)?.nombre || `Cliente #${id}`;
  }

  obtenerNombreProfesional(id: number): string {
    return this.profesionales.find(p => p.id === id)?.nombre || `Profesional #${id}`;
  }

  obtenerNombreServicio(id: number): string {
    return this.servicios.find(s => s.id === id)?.nombre || `Servicio #${id}`;
  }

  // ==================== MÉTODOS PARA ESTADÍSTICAS ====================

  contarSolicitudesPendientes(): number {
    return this.solicitudes.filter(s => s.estado === 'pendiente').length;
  }

  contarSolicitudesUrgentes(): number {
    return this.solicitudes.filter(s => s.urgencia).length;
  }

  contarSolicitudesCompletadas(): number {
    return this.solicitudes.filter(s => s.estado === 'completada').length;
  }
}