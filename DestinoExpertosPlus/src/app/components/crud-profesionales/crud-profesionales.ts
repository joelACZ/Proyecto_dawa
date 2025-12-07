import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Profesional } from '../../models/Profesional.model';
import { ServProfesionalesJson } from '../../services/profesionales-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';

declare const bootstrap: any;

@Component({
  selector: 'app-crud-profesionales',
  standalone: true,
  templateUrl: './crud-profesionales.html',
  styleUrls: ['./crud-profesionales.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal],
})
export class CrudProfesionales implements OnInit {
  // ============================================
  // SECCIÓN 1: PROPIEDADES DE DATOS Y ESTADO
  // ============================================
  profesionales: Profesional[] = [];
  profesionalesParaTabla: any[] = [];
  profesionalEdit: Profesional | null = null;
  modalRef: any;

  // ============================================
  // SECCIÓN 2: PROPIEDADES DE MODALES
  // ============================================
  profesionalDetalle: Profesional | null = null;
  showDetailModal: boolean = false;
  showDeleteModal = false;
  showNotificationModal = false;
  showErrorModal = false;
  profesional_a_Eliminar: Profesional | null = null;
  notificationMessage = '';
  errorMessage = '';

  // ============================================
  // SECCIÓN 3: PROPIEDADES DE FORMULARIO
  // ============================================
  formProfesional!: FormGroup;

  // ============================================
  // SECCIÓN 4: PROPIEDADES DE PAGINACIÓN
  // ============================================
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;

  // ============================================
  // SECCIÓN 5: PROPIEDADES DE FILTRADO
  // ============================================
  filtroEspecialidad: string = '';
  filtroExperienciaMin: number = 0;
  filtroDisponibilidad: string | null = null;

  // ============================================
  // SECCIÓN 6: OPCIONES Y CONFIGURACIONES
  // ============================================
  @ViewChild('profesionalModal') modalElement!: ElementRef;

  // ============================================
  // SECCIÓN 7: CONSTRUCTOR E INICIALIZACIÓN
  // ============================================
  constructor(
    private servProfesionales: ServProfesionalesJson,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    this.loadProfesionales();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  // ============================================
  // SECCIÓN 8: MÉTODOS DE FORMULARIO
  // ============================================
  inicializarFormulario() {
    this.formProfesional = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      especialidad: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]],
      ubicacion: [''],
      oficios: [''],
      experiencia: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      disponibilidad: [true]
    });
  }

  save() {
    if (this.formProfesional.invalid) {
      this.formProfesional.markAllAsTouched();
      return;
    }

    const datos = {
      ...this.formProfesional.value,
      oficios: this.formProfesional.value.oficios
        ? this.formProfesional.value.oficios
            .split(',')
            .map((o: string) => o.trim())
            .filter(Boolean)
        : [],
      experiencia: Number(this.formProfesional.value.experiencia)
    };

    if (this.profesionalEdit?.id) {
      const updated: Profesional = { ...this.profesionalEdit, ...datos };
      
      this.servProfesionales.update(updated).subscribe({
        next: () => {
          this.loadProfesionales();
          this.modalRef.hide();
          this.showNotification('Profesional actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar profesional:', err);
          this.showError('Error al actualizar profesional');
        }
      });
    } else {
      this.servProfesionales.create(datos as Profesional).subscribe({
        next: () => {
          this.loadProfesionales();
          this.modalRef.hide();
          this.showNotification('Profesional creado correctamente');
        },
        error: (err) => {
          console.error('Error al crear profesional:', err);
          this.showError('Error al crear profesional');
        }
      });
    }
  }

  // ============================================
  // SECCIÓN 9: MÉTODOS DE CARGA DE DATOS
  // ============================================
  loadProfesionales() {
    this.servProfesionales.getProfesionales().subscribe({
      next: (data) => {
        this.profesionales = data;
        this.formatearDatosParaTabla();
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
    let profesionalesAMostrar = [...this.profesionales];

    // Aplicar filtro por especialidad
    if (this.filtroEspecialidad) {
      const filtroLower = this.filtroEspecialidad.toLowerCase();
      profesionalesAMostrar = profesionalesAMostrar.filter(p => 
        p.especialidad?.toLowerCase().includes(filtroLower)
      );
    }

    // Aplicar filtro por experiencia mínima
    if (this.filtroExperienciaMin > 0) {
      profesionalesAMostrar = profesionalesAMostrar.filter(p => 
        p.experiencia >= this.filtroExperienciaMin
      );
    }

    // Aplicar filtro por disponibilidad
    if (this.filtroDisponibilidad !== null) {
      const isAvailable = this.filtroDisponibilidad === 'true';
      profesionalesAMostrar = profesionalesAMostrar.filter(p => 
        p.disponibilidad === isAvailable
      );
    }

    this.profesionalesParaTabla = profesionalesAMostrar.map(p => ({
      ...p,
      ubicacionFormateada: p.ubicacion || 'No especificada',
      oficiosFormateados: Array.isArray(p.oficios) 
        ? p.oficios.join(', ') 
        : p.oficios || 'No especificados',
      experienciaFormateada: `${p.experiencia} años`,
      disponibilidadFormateada: p.disponibilidad ? 'Sí' : 'No'
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

    this.servProfesionales.searchProfesionales(param).subscribe({
      next: (resultadosBusqueda) => {
        let profesionalesAMostrar = [...resultadosBusqueda];

        // Aplicar filtros a los resultados de búsqueda
        if (this.filtroEspecialidad) {
          const filtroLower = this.filtroEspecialidad.toLowerCase();
          profesionalesAMostrar = profesionalesAMostrar.filter(p => 
            p.especialidad?.toLowerCase().includes(filtroLower)
          );
        }

        if (this.filtroExperienciaMin > 0) {
          profesionalesAMostrar = profesionalesAMostrar.filter(p => 
            p.experiencia >= this.filtroExperienciaMin
          );
        }

        if (this.filtroDisponibilidad !== null) {
          const isAvailable = this.filtroDisponibilidad === 'true';
          profesionalesAMostrar = profesionalesAMostrar.filter(p => 
            p.disponibilidad === isAvailable
          );
        }

        this.profesionalesParaTabla = profesionalesAMostrar.map(p => ({
          ...p,
          ubicacionFormateada: p.ubicacion || 'No especificada',
          oficiosFormateados: Array.isArray(p.oficios) 
            ? p.oficios.join(', ') 
            : p.oficios || 'No especificados',
          experienciaFormateada: `${p.experiencia} años`,
          disponibilidadFormateada: p.disponibilidad ? 'Sí' : 'No'
        }));

        this.calcularPaginacion();
        this.paginaActual = 1;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.showError('Error al buscar profesionales');
      }
    });
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  limpiarFiltros(): void {
    this.filtroEspecialidad = '';
    this.filtroExperienciaMin = 0;
    this.filtroDisponibilidad = null;
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  // ============================================
  // SECCIÓN 11: MÉTODOS DE PAGINACIÓN
  // ============================================
  get profesionalesPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.profesionalesParaTabla.slice(inicio, fin);
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.profesionalesParaTabla.length / this.itemsPorPagina);
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
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.profesionalesParaTabla.length);
    return `${inicio}-${fin} de ${this.profesionalesParaTabla.length}`;
  }

  // ============================================
  // SECCIÓN 12: MÉTODOS CRUD - CREAR/EDITAR
  // ============================================
  openNew() {
    this.profesionalEdit = null;
    this.formProfesional.reset({ 
      experiencia: 0,
      disponibilidad: true
    });
    this.modalRef.show();
  }

  openEdit(profesional: Profesional) {
    this.profesionalEdit = { ...profesional };
    this.formProfesional.patchValue({
      ...profesional,
      oficios: Array.isArray(profesional.oficios) 
        ? profesional.oficios.join(', ') 
        : profesional.oficios || ''
    });
    this.modalRef.show();
  }

  // ============================================
  // SECCIÓN 13: MÉTODOS CRUD - ELIMINAR
  // ============================================
  openDeleteModal(profesional: Profesional) {
    this.profesional_a_Eliminar = profesional;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.profesional_a_Eliminar?.id) return;

    this.servProfesionales.delete(this.profesional_a_Eliminar.id).subscribe({
      next: () => {
        this.showNotification('Profesional eliminado correctamente');
        this.loadProfesionales();
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error al eliminar profesional:', err);
        this.showError('Error al eliminar profesional');
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.profesional_a_Eliminar = null;
  }

  // ============================================
  // SECCIÓN 14: MÉTODOS DE VISUALIZACIÓN/DETALLE
  // ============================================
  view(profesional: Profesional) {
    this.profesionalDetalle = profesional;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.profesionalDetalle = null;
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