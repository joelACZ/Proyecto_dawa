import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Resena } from '../../models/Resena.model';
import { Solicitud } from '../../models/Solicitud.model';
import { ServResenasJson } from '../../services/resena-service';
import { SolicitudService } from '../../services/solicitud-service';
import { ServClientesJson } from '../../services/cliente-service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from "../shared/detail-modal/detail-modal";

declare const bootstrap: any;

@Component({
  selector: 'app-resena-crud',
  standalone: true,
  templateUrl: './crud-resenas.html',
  styleUrls: ['./crud-resenas.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal],
})
export class CrudResenas implements OnInit {
  resenas: Resena[] = [];
  resenasOriginales: Resena[] = []; // NUEVA: guardar los datos originales
  resenasParaTabla: any[] = [];
  resenaEdit: Resena | null = null;
  modalRef: any;

  // Lista de solicitudes y clientes
  solicitudes: Solicitud[] = [];
  clientes: any[] = [];

  // PARA EL MODAL REUTILIZABLE (DetailModal)
  resenaDetalle: Resena | null = null;
  showDetailModal: boolean = false;

  // Otros modales
  showDeleteModal = false;
  showNotificationModal = false;
  showErrorModal = false;
  resenaAEliminar: Resena | null = null;
  notificationMessage = '';
  errorMessage = '';

  formResena!: FormGroup;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;

  // Filtros
  filtroCalificacion: number = 0; // 0 = todas
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  opcionesCalificacion = [
    { valor: 1, texto: '1★ - Pésimo servicio' },
    { valor: 2, texto: '2★ - Mal servicio' },
    { valor: 3, texto: '3★ - Servicio regular' },
    { valor: 4, texto: '4★ - Buen servicio' },
    { valor: 5, texto: '5★ - Excelente servicio' },
  ];

  opcionesFiltroCalificacion = [
    { valor: 0, texto: 'Todas las calificaciones' },
    { valor: 1, texto: '1★ - Pésimo servicio' },
    { valor: 2, texto: '2★ - Mal servicio' },
    { valor: 3, texto: '3★ - Servicio regular' },
    { valor: 4, texto: '4★ - Buen servicio' },
    { valor: 5, texto: '5★ - Excelente servicio' },
  ];

  @ViewChild('resenaModal') modalElement!: ElementRef;

  constructor(
    private servResenas: ServResenasJson,
    private solicitudService: SolicitudService,
    private clienteService: ServClientesJson,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.loadResenas();
    this.loadSolicitudes();
    this.loadClientes();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  inicializarFormulario() {
    this.formResena = this.fb.group({
      solicitud_id: ['', [Validators.required, Validators.min(1)]],
      calificacion: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      fecha: ['', Validators.required],
      anonima: [false],
    });
  }

  loadResenas() {
    this.servResenas.getResenas().subscribe({
      next: (data) => {
        this.resenas = data;
        this.resenasOriginales = [...data]; // GUARDAR copia de los originales
        this.formatearDatosParaTabla();
      },
      error: (err) => {
        console.error('Error al cargar reseñas:', err);
        this.showError('Error al cargar reseñas');
      }
    });
  }

  loadSolicitudes() {
    this.solicitudService.getSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        console.log('Solicitudes cargadas:', this.solicitudes);
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.showError('Error al cargar solicitudes');
      }
    });
  }

  loadClientes() {
    this.clienteService.getClientes().subscribe({
      next: (data: any[]) => {
        this.clientes = data;
        console.log('Clientes cargados:', this.clientes);
      },
      error: (err: any) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  formatearDatosParaTabla() {
    // SIEMPRE partir de los datos originales
    let resenasAMostrar = [...this.resenasOriginales];

    // Aplicar filtro de calificación
    if (this.filtroCalificacion > 0) {
      resenasAMostrar = resenasAMostrar.filter(r => Number(r.calificacion) === Number(this.filtroCalificacion));
    }

    // Aplicar filtro de rango de fechas
    if (this.filtroFechaInicio) {
      const fechaInicio = new Date(this.filtroFechaInicio);
      resenasAMostrar = resenasAMostrar.filter(r => {
        const fechaResena = new Date(r.fecha);
        return fechaResena >= fechaInicio;
      });
    }

    if (this.filtroFechaFin) {
      const fechaFin = new Date(this.filtroFechaFin);
      fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día
      resenasAMostrar = resenasAMostrar.filter(r => {
        const fechaResena = new Date(r.fecha);
        return fechaResena <= fechaFin;
      });
    }

    this.resenasParaTabla = resenasAMostrar.map(r => ({
      ...r,
      calificacionFormateada: `${r.calificacion} ★ - ${this.obtenerTextoCalificacion(r.calificacion)}`,
      anonimaFormateada: r.anonima ? 'Sí' : 'No'
    }));
    this.calcularPaginacion();
  }

  search(input: HTMLInputElement) {
    const param = input.value.trim();
    
    if (!param) {
      // Si no hay búsqueda, aplicar solo los filtros
      this.formatearDatosParaTabla();
      this.paginaActual = 1;
      return;
    }

    // Buscar en los datos originales
    const resultadosBusqueda = this.resenasOriginales.filter(r =>
      r.comentario.toLowerCase().includes(param.toLowerCase()) ||
      String(r.calificacion).includes(param) ||
      String(r.solicitud_id).includes(param)
    );

    // Aplicar filtros sobre los resultados de búsqueda
    let resenasAMostrar = [...resultadosBusqueda];

    // Aplicar filtro de calificación
    if (this.filtroCalificacion > 0) {
      resenasAMostrar = resenasAMostrar.filter(r => r.calificacion === this.filtroCalificacion);
    }

    // Aplicar filtro de rango de fechas
    if (this.filtroFechaInicio) {
      const fechaInicio = new Date(this.filtroFechaInicio);
      resenasAMostrar = resenasAMostrar.filter(r => {
        const fechaResena = new Date(r.fecha);
        return fechaResena >= fechaInicio;
      });
    }

    if (this.filtroFechaFin) {
      const fechaFin = new Date(this.filtroFechaFin);
      fechaFin.setHours(23, 59, 59, 999);
      resenasAMostrar = resenasAMostrar.filter(r => {
        const fechaResena = new Date(r.fecha);
        return fechaResena <= fechaFin;
      });
    }

    this.resenasParaTabla = resenasAMostrar.map(r => ({
      ...r,
      calificacionFormateada: `${r.calificacion} ★ - ${this.obtenerTextoCalificacion(r.calificacion)}`,
      anonimaFormateada: r.anonima ? 'Sí' : 'No'
    }));
    
    this.calcularPaginacion();
    this.paginaActual = 1;
  }

  openNew() {
    this.resenaEdit = null;
    this.formResena.reset({ anonima: false });
    this.modalRef.show();
  }

  openEdit(resena: Resena) {
    this.resenaEdit = { ...resena };
    const fecha = typeof resena.fecha === 'string' ? resena.fecha : new Date(resena.fecha).toISOString().split('T')[0];
    this.formResena.patchValue({
      solicitud_id: resena.solicitud_id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: fecha,
      anonima: resena.anonima
    });
    this.modalRef.show();
  }

  save() {
    if (this.formResena.invalid) {
      this.formResena.markAllAsTouched();
      return;
    }

    const datos = this.formResena.value;

    if (this.resenaEdit?.id) {
      const updated: Resena = { ...this.resenaEdit, ...datos, calificacion: Number(datos.calificacion) };
      this.servResenas.update(updated).subscribe({
        next: () => {
          this.loadResenas();
          this.modalRef.hide();
          this.showNotification('Reseña actualizada');
        }
      });
    } else {
      this.servResenas.create({ ...datos, calificacion: Number(datos.calificacion) } as Resena).subscribe({
        next: () => {
          this.loadResenas();
          this.modalRef.hide();
          this.showNotification('Reseña creada');
        }
      });
    }
  }

  view(resena: Resena) {
    this.resenaDetalle = resena;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.resenaDetalle = null;
  }

  openDeleteModal(resena: Resena) {
    this.resenaAEliminar = resena;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.resenaAEliminar?.id) return;
    this.servResenas.delete(this.resenaAEliminar.id).subscribe({
      next: () => {
        this.showNotification('Reseña eliminada');
        this.loadResenas();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.resenaAEliminar = null;
  }

  showNotification(msg: string) {
    this.notificationMessage = msg;
    this.showNotificationModal = true;
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.showErrorModal = true;
  }

  obtenerTextoCalificacion(c: number): string {
    const t = ['', 'Pésimo servicio', 'Mal servicio', 'Servicio regular', 'Buen servicio', 'Excelente servicio'];
    return t[c] || '';
  }

  getSolicitudDescripcion(solicitudId: number): string {
    const solicitud = this.solicitudes.find(s => s.id === solicitudId);
    return solicitud ? solicitud.descripcion : 'N/A';
  }

  getClienteNombre(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'Cliente desconocido';
  }

  // Métodos de paginación
  get resenasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.resenasParaTabla.slice(inicio, fin);
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.resenasParaTabla.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get rangoRegistros(): string {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.resenasParaTabla.length);
    return `${inicio}-${fin} de ${this.resenasParaTabla.length}`;
  }

  // Métodos de filtrado
  aplicarFiltros(): void {
    this.paginaActual = 1; // Resetear a la primera página
    this.formatearDatosParaTabla();
  }

  limpiarFiltros(): void {
    this.filtroCalificacion = 0;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }
}