import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importación de modelos y servicios
import { Profesional } from '../../models/Profesional.model';
import { ServProfesionalAPI } from '../../services/profesionales-service-API';

// Componentes compartidos
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';

declare const bootstrap: any;

@Component({
  selector: 'app-crud-profesionales',
  standalone: true,
  templateUrl: './crud-profesionales.html',
  styleUrls: ['./crud-profesionales.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DataTableComponent,
    CardComponent,
    DetailModal
  ],
})
export class CrudProfesionales implements OnInit, AfterViewInit {
  // Datos
  public listaOriginal: Profesional[] = [];
  public profesionalesParaTabla: any[] = [];
  public profesionalEnEdicion: Profesional | null = null;
  public profesionalDetalle: Profesional | null = null;
  public profesionalAEliminar: Profesional | null = null;

  // Formulario y UI
  public formularioProfesional!: FormGroup;
  public modalRef: any;
  public mensajeNotificacion = '';
  public mensajeError = '';

  // Visibilidad de Modales
  public mostrarModalDetalle = false;
  public mostrarModalEliminar = false;
  public mostrarModalNotificacion = false;
  public mostrarModalError = false;

  // Paginación y Filtros
  public paginaActual = 1;
  public itemsPorPagina = 8;
  public totalPaginas = 1;
  public filtroEspecialidad = '';
  public filtroExperienciaMin = 0;
  public filtroDisponibilidad: string | null = null;

  @ViewChild('modalProfesional') elementoModal!: ElementRef;

  constructor(
    private servicio: ServProfesionalAPI,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarProfesionales();
  }

  ngAfterViewInit() {
    if (this.elementoModal) {
      this.modalRef = new bootstrap.Modal(this.elementoModal.nativeElement);
    }
  }

  private inicializarFormulario() {
    this.formularioProfesional = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      especialidad: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [null, [Validators.required]],
      direccion: [''],
      oficios: ['', [Validators.required]], // Mantenlo como string para que coincida con C#
      experiencia: [0, [Validators.required, Validators.min(0)]],
      disponibilidad: [true],
    });
  }

  public cargarProfesionales() {
    this.servicio.obtenerTodos().subscribe({
      next: (datos) => {
        this.listaOriginal = datos;
        this.procesarDatosYFiltrar();
      },
      error: (err) => {
        console.error(err);
        this.mostrarError('Error al cargar los profesionales');
      }
    });
  }

  public procesarDatosYFiltrar() {
    let filtrados = [...this.listaOriginal];

    if (this.filtroEspecialidad) {
      const term = this.filtroEspecialidad.toLowerCase();
      filtrados = filtrados.filter(p => p.especialidad.toLowerCase().includes(term));
    }
    
    if (this.filtroExperienciaMin > 0) {
      filtrados = filtrados.filter(p => p.experiencia >= this.filtroExperienciaMin);
    }

    if (this.filtroDisponibilidad !== null && this.filtroDisponibilidad !== "") {
      const disp = this.filtroDisponibilidad === 'true';
      filtrados = filtrados.filter(p => p.disponibilidad === disp);
    }

    this.profesionalesParaTabla = filtrados.map(p => ({
      ...p,
      oficiosDisplay: Array.isArray(p.oficios) ? p.oficios.join(', ') : p.oficios,
      disponibilidadDisplay: p.disponibilidad ? 'Sí' : 'No',
      experienciaDisplay: `${p.experiencia} años`
    }));

    this.totalPaginas = Math.ceil(this.profesionalesParaTabla.length / this.itemsPorPagina);
  }

  /**
   * MÉTODO GUARDAR CORREGIDO PARA EVITAR EL ERROR 400
   */
  public guardar() {
    if (this.formularioProfesional.invalid) {
      this.formularioProfesional.markAllAsTouched();
      return;
    }

    // Clonamos el valor del formulario
    const formValue = this.formularioProfesional.value;

    // PREPARACIÓN DEL PAYLOAD:
    // 1. Aseguramos que 'oficios' sea un string si el backend lo espera así
    // 2. Si estamos editando, incluimos el ID en el cuerpo del objeto
    const payload: any = {
      ...formValue,
      oficios: Array.isArray(formValue.oficios) ? formValue.oficios.join(', ') : formValue.oficios,
      id: this.profesionalEnEdicion ? this.profesionalEnEdicion.id : 0
    };

    if (this.profesionalEnEdicion) {
      this.servicio.actualizar(this.profesionalEnEdicion.id, payload).subscribe({
        next: () => this.finalizarGuardado('Actualizado con éxito'),
        error: (err) => this.manejarErrorAPI(err)
      });
    } else {
      this.servicio.crear(payload).subscribe({
        next: () => this.finalizarGuardado('Creado con éxito'),
        error: (err) => this.manejarErrorAPI(err)
      });
    }
  }

  private finalizarGuardado(mensaje: string) {
    this.mostrarNotificacion(mensaje);
    this.cargarProfesionales();
    this.modalRef.hide();
  }

  private manejarErrorAPI(err: any) {
    console.error('Error 400 Detalle:', err);
    // Si el backend envía detalles de validación, los capturamos
    const detalle = err.error?.title || err.error?.message || 'Datos inválidos';
    this.mostrarError(`Error al guardar: ${detalle}`);
  }

  public abrirEdicion(profesional: Profesional) {
    this.profesionalEnEdicion = profesional;
    this.formularioProfesional.patchValue(profesional);
    this.modalRef.show();
  }

  public abrirNuevo() {
    this.profesionalEnEdicion = null;
    this.formularioProfesional.reset({ 
      experiencia: 0, 
      disponibilidad: true,
      oficios: '' 
    });
    this.modalRef.show();
  }

  public confirmarEliminacion() {
    if (!this.profesionalAEliminar) return;
    this.servicio.eliminar(this.profesionalAEliminar.id).subscribe({
      next: () => {
        this.cargarProfesionales();
        this.mostrarModalEliminar = false;
        this.mostrarNotificacion('Eliminado correctamente');
      },
      error: () => this.mostrarError('No se pudo eliminar el registro')
    });
  }

  get datosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.profesionalesParaTabla.slice(inicio, inicio + this.itemsPorPagina);
  }

  public mostrarNotificacion(msj: string) {
    this.mensajeNotificacion = msj;
    this.mostrarModalNotificacion = true;
    setTimeout(() => this.mostrarModalNotificacion = false, 3000);
  }

  public mostrarError(msj: string) {
    this.mensajeError = msj;
    this.mostrarModalError = true;
  }
}