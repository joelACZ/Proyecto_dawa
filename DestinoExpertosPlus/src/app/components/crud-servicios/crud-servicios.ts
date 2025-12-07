import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../models/Servicio.model';
import { Profesional } from '../../models/Profesional.model';
import { CATEGORIAS_SERVICIOS } from '../../models/categoria.model';
import { ServServiciosJson } from '../../services/servicio-service';
import { ServProfesionalesJson } from '../../services/profesionales-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';

declare const bootstrap: any;

@Component({
  selector: 'app-servicio-crud',
  standalone: true,
  templateUrl: './crud-servicios.html',
  styleUrls: ['./crud-servicios.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal],
})
export class CrudServicios implements OnInit {
  // ============================================
  // SECCIÓN 1: PROPIEDADES DE DATOS Y ESTADO
  // ============================================
  servicios: Servicio[] = [];
  serviciosParaTabla: any[] = [];
  servicioEdit: Servicio | null = null;
  modalRef: any;
  profesionales: Profesional[] = [];

  // ============================================
  // SECCIÓN 2: PROPIEDADES DE MODALES
  // ============================================
  servicioDetalle: Servicio | null = null;
  showDetailModal: boolean = false;
  showDeleteModal = false;
  showNotificationModal = false;
  showErrorModal = false;
  servicio_a_Eliminar: Servicio | null = null;
  notificationMessage = '';
  errorMessage = '';

  // ============================================
  // SECCIÓN 3: PROPIEDADES DE FORMULARIO
  // ============================================
  formServicio!: FormGroup;

  // ============================================
  // SECCIÓN 4: PROPIEDADES DE PAGINACIÓN
  // ============================================
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;

  // ============================================
  // SECCIÓN 5: PROPIEDADES DE FILTRADO
  // ============================================
  filtroCategoria: string = '';
  filtroActivo: string | null = null;

  // ============================================
  // SECCIÓN 6: OPCIONES Y CONFIGURACIONES
  // ============================================
  categorias = CATEGORIAS_SERVICIOS;
  @ViewChild('servicioModal') modalElement!: ElementRef;

  // ============================================
  // SECCIÓN 7: CONSTRUCTOR E INICIALIZACIÓN
  // ============================================
  constructor(
    private servServicios: ServServiciosJson,
    private servProfesionales: ServProfesionalesJson,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    this.loadServicios();
    this.loadProfesionales();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  // ============================================
  // SECCIÓN 8: MÉTODOS DE FORMULARIO
  // ============================================
  inicializarFormulario() {
    this.formServicio = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      precioBase: [0, [Validators.required, Validators.min(0)]],
      duracionEstimada: [0, [Validators.required, Validators.min(1)]],
      profesional_id: ['', Validators.required],
      activo: [true]
    });
  }

  save() {
    if (this.formServicio.invalid) {
      this.formServicio.markAllAsTouched();
      return;
    }

    const datos = this.formServicio.value;

    if (this.servicioEdit?.id) {
      const updated: Servicio = { 
        ...this.servicioEdit, 
        ...datos,
        precioBase: Number(datos.precioBase),
        duracionEstimada: Number(datos.duracionEstimada),
        profesional_id: Number(datos.profesional_id)
      };

      this.servServicios.update(updated).subscribe({
        next: () => {
          this.loadServicios();
          this.modalRef.hide();
          this.showNotification('Servicio actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar servicio:', err);
          this.showError('Error al actualizar servicio');
        }
      });
    } else {
      const nuevoServicio: Servicio = {
        ...datos,
        precioBase: Number(datos.precioBase),
        duracionEstimada: Number(datos.duracionEstimada),
        profesional_id: Number(datos.profesional_id)
      } as Servicio;

      this.servServicios.create(nuevoServicio).subscribe({
        next: () => {
          this.loadServicios();
          this.modalRef.hide();
          this.showNotification('Servicio creado correctamente');
        },
        error: (err) => {
          console.error('Error al crear servicio:', err);
          this.showError('Error al crear servicio');
        }
      });
    }
  }

  // ============================================
  // SECCIÓN 9: MÉTODOS DE CARGA DE DATOS
  // ============================================
  loadServicios() {
    this.servServicios.getServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.formatearDatosParaTabla();
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.showError('Error al cargar servicios');
      }
    });
  }

  loadProfesionales() {
    this.servProfesionales.obtenerTodos().subscribe({
      next: (data) => {
        this.profesionales = data;
      },
      error: (err) => {
        console.error('Error al cargar profesionales:', err);
        this.showError('Error al cargar profesionales');
      }
    });
  }

  // ============================================
  // SECCIÓN 10: MÉTODOS DE TABLA Y FILTRADO
  // ============================================
  formatearDatosParaTabla() {
    let serviciosAMostrar = [...this.servicios];

    // Aplicar filtro por categoría
    if (this.filtroCategoria) {
      serviciosAMostrar = serviciosAMostrar.filter(s => 
        s.categoria === this.filtroCategoria
      );
    }

    // Aplicar filtro por estado activo
    if (this.filtroActivo !== null) {
      const isActive = this.filtroActivo === 'true';
      serviciosAMostrar = serviciosAMostrar.filter(s => 
        s.activo === isActive
      );
    }

    this.serviciosParaTabla = serviciosAMostrar.map(s => ({
      ...s,
      descripcionCorta: s.descripcion.length > 50 ? s.descripcion.substring(0, 50) + '...' : s.descripcion,
      precioBaseFormateado: `$${s.precioBase.toFixed(2)}`,
      duracionFormateada: `${s.duracionEstimada} min`,
      profesionalNombre: this.getProfesionalNombre(s.profesional_id),
      activoFormateado: s.activo ? 'Sí' : 'No'
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

    this.servServicios.searchServicios(param).subscribe({
      next: (resultadosBusqueda) => {
        let serviciosAMostrar = [...resultadosBusqueda];

        // Aplicar filtros a los resultados de búsqueda
        if (this.filtroCategoria) {
          serviciosAMostrar = serviciosAMostrar.filter(s => 
            s.categoria === this.filtroCategoria
          );
        }

        if (this.filtroActivo !== null) {
          const isActive = this.filtroActivo === 'true';
          serviciosAMostrar = serviciosAMostrar.filter(s => 
            s.activo === isActive
          );
        }

        this.serviciosParaTabla = serviciosAMostrar.map(s => ({
          ...s,
          descripcionCorta: s.descripcion.length > 50 ? s.descripcion.substring(0, 50) + '...' : s.descripcion,
          precioBaseFormateado: `$${s.precioBase.toFixed(2)}`,
          duracionFormateada: `${s.duracionEstimada} min`,
          profesionalNombre: this.getProfesionalNombre(s.profesional_id),
          activoFormateado: s.activo ? 'Sí' : 'No'
        }));

        this.calcularPaginacion();
        this.paginaActual = 1;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.showError('Error al buscar servicios');
      }
    });
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  limpiarFiltros(): void {
    this.filtroCategoria = '';
    this.filtroActivo = null;
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  getProfesionalNombre(profesionalId: number): string {
    const profesional = this.profesionales.find(p => p.id === profesionalId);
    return profesional ? profesional.nombre : 'No asignado';
  }

  // ============================================
  // SECCIÓN 11: MÉTODOS DE PAGINACIÓN
  // ============================================
  get serviciosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.serviciosParaTabla.slice(inicio, fin);
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.serviciosParaTabla.length / this.itemsPorPagina);
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
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.serviciosParaTabla.length);
    return `${inicio}-${fin} de ${this.serviciosParaTabla.length}`;
  }

  // ============================================
  // SECCIÓN 12: MÉTODOS CRUD - CREAR/EDITAR
  // ============================================
  openNew() {
    this.servicioEdit = null;
    this.formServicio.reset({ 
      activo: true,
      precioBase: 0,
      duracionEstimada: 0
    });
    this.modalRef.show();
  }

  openEdit(servicio: Servicio) {
    this.servicioEdit = { ...servicio };
    this.formServicio.patchValue({
      ...servicio,
      profesional_id: servicio.profesional_id.toString()
    });
    this.modalRef.show();
  }

  // ============================================
  // SECCIÓN 13: MÉTODOS CRUD - ELIMINAR
  // ============================================
  openDeleteModal(servicio: Servicio) {
    this.servicio_a_Eliminar = servicio;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.servicio_a_Eliminar?.id) return;

    this.servServicios.delete(this.servicio_a_Eliminar.id).subscribe({
      next: () => {
        this.showNotification('Servicio eliminado correctamente');
        this.loadServicios();
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error al eliminar servicio:', err);
        this.showError('Error al eliminar servicio');
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.servicio_a_Eliminar = null;
  }

  // ============================================
  // SECCIÓN 14: MÉTODOS DE VISUALIZACIÓN/DETALLE
  // ============================================
  view(servicio: Servicio) {
    this.servicioDetalle = servicio;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.servicioDetalle = null;
  }

  // ============================================
  // SECCIÓN 15: MÉTODOS DE NOTIFICACIÓN Y ERROR
  // ============================================
  showNotification(msg: string) {
    this.notificationMessage = msg;
    this.showNotificationModal = true;
    setTimeout(() => {
      this.showNotificationModal = false;
    }, 3000);
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.showErrorModal = true;
    setTimeout(() => {
      this.showErrorModal = false;
    }, 3000);
  }
}