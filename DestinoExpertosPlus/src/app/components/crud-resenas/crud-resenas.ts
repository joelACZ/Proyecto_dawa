  // ============================================
// SECCIÓN 1: IMPORTS Y DECORADOR COMPONENTE
// ============================================
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Modelos
import { Resena } from '../../models/Resena.model';
import { Solicitud } from '../../models/Solicitud.model';

// Servicios
import { ServResenasJson } from '../../services/resena-service';
import { SolicitudService } from '../../services/solicitud-service';
import { ServClientesJson } from '../../services/cliente-service';

// Componentes compartidos
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from "../shared/detail-modal/detail-modal";

// Bootstrap (externa)
declare const bootstrap: any;

@Component({
  selector: 'app-resena-crud',
  standalone: true,
  templateUrl: './crud-resenas.html',
  styleUrls: ['./crud-resenas.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal],
})
export class CrudResenas implements OnInit {
  
  // ============================================
  // SECCIÓN 2: PROPIEDADES DE DATOS Y ESTADO
  // ============================================
  
  resenas: Resena[] = [];
  resenasParaTabla: any[] = [];
  resenaEdit: Resena | null = null;
  modalRef: any;
  
  solicitudes: Solicitud[] = [];
  clientes: any[] = [];
  
  // ============================================
  // SECCIÓN 3: PROPIEDADES DE MODALES
  // ============================================
  resenaDetalle: Resena | null = null;
  showDetailModal: boolean = false;
  showDeleteModal = false;
  showNotificationModal = false;
  showErrorModal = false;
  resena_a_Eliminar: Resena | null = null;
  notificationMessage = '';
  errorMessage = '';
  
  // ============================================
  // SECCIÓN 4: PROPIEDADES DE FORMULARIO
  // ============================================
  formResena!: FormGroup;
  
  // ============================================
  // SECCIÓN 5: PROPIEDADES DE PAGINACIÓN
  // ============================================
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;
  
  // ============================================
  // SECCIÓN 6: PROPIEDADES DE FILTRADO
  // ============================================
  filtroCalificacion: number = 0;
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  
  // ============================================
  // SECCIÓN 7: OPCIONES Y CONFIGURACIONES
  // ============================================
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
  
  // ============================================
  // SECCIÓN 8: CONSTRUCTOR E INICIALIZACIÓN
  // ============================================
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
  
  // ============================================
  // SECCIÓN 9: MÉTODOS DE FORMULARIO
  // ============================================
  inicializarFormulario() {
    this.formResena = this.fb.group({
      solicitud_id: ['', [Validators.required, Validators.min(1)]],
      calificacion: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      fecha: ['', Validators.required],
      anonima: [false],
    });
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
  
  // ============================================
  // SECCIÓN 10: MÉTODOS DE CARGA DE DATOS
  // ============================================
  loadResenas() {
    this.servResenas.getResenas().subscribe({
      next: (data) => {
        this.resenas = data;
        this.resenas = [...data];
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
  
  // ============================================
  // SECCIÓN 11: MÉTODOS DE TABLA Y FILTRADO
  // ============================================
  formatearDatosParaTabla() {
    let resenasAMostrar = [...this.resenas];
    
    if (this.filtroCalificacion > 0) {
      resenasAMostrar = resenasAMostrar.filter(r => Number(r.calificacion) === Number(this.filtroCalificacion));
    }
    
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
  }
  
  search(input: HTMLInputElement) {
    const param = input.value.trim();
    
    if (!param) {
      this.formatearDatosParaTabla();
      this.paginaActual = 1;
      return;
    }
    
    const resultadosBusqueda = this.resenas.filter(r =>
      r.comentario.toLowerCase().includes(param.toLowerCase()) ||
      String(r.calificacion).includes(param) ||
      String(r.solicitud_id).includes(param)
    );
    
    let resenasAMostrar = [...resultadosBusqueda];
    
    if (this.filtroCalificacion > 0) {
      resenasAMostrar = resenasAMostrar.filter(r => r.calificacion === this.filtroCalificacion);
    }
    
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
  
  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }
  
  limpiarFiltros(): void {
    this.filtroCalificacion = 0;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }
  
  // ============================================
  // SECCIÓN 12: MÉTODOS DE PAGINACIÓN
  // ============================================
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
  
  // ============================================
  // SECCIÓN 13: MÉTODOS CRUD - CREAR/EDITAR
  // ============================================
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
  
  // ============================================
  // SECCIÓN 14: MÉTODOS CRUD - ELIMINAR
  // ============================================
  openDeleteModal(resena: Resena) {
    this.resena_a_Eliminar = resena;
    this.showDeleteModal = true;
  }
  
  confirmDelete() {
    if (!this.resena_a_Eliminar?.id) return;
    
    this.servResenas.delete(this.resena_a_Eliminar.id).subscribe({
      next: () => {
        this.showNotification('Reseña eliminada');
        this.loadResenas();
        this.closeDeleteModal();
      }
    });
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.resena_a_Eliminar = null;
  }
  
  // ============================================
  // SECCIÓN 15: MÉTODOS DE VISUALIZACIÓN/DETALLE
  // ============================================
  view(resena: Resena) {
    this.resenaDetalle = resena;
    this.showDetailModal = true;
  }
  
  closeDetail() {
    this.showDetailModal = false;
    this.resenaDetalle = null;
  }
  
  // ============================================
  // SECCIÓN 16: MÉTODOS AUXILIARES
  // ============================================
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
  
  // ============================================
  // SECCIÓN 17: MÉTODOS DE NOTIFICACIÓN Y ERROR
  // ============================================
  showNotification(msg: string) {
    this.notificationMessage = msg;
    this.showNotificationModal = true;
  }
  
  showError(msg: string) {
    this.errorMessage = msg;
    this.showErrorModal = true;
  }
}