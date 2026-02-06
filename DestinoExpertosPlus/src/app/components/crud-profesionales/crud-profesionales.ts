import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';
import { ServProfesionalAPI } from '../../services/profesionales-service-API';

declare const bootstrap: any;

@Component({
  selector: 'app-crud-profesionales',
  standalone: true,
  templateUrl: './crud-profesionales.html',
  styleUrls: ['./crud-profesionales.css'],
  imports: [
    DataTableComponent,
    CardComponent,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DetailModal,
  ],
})
export class CrudProfesionales implements OnInit, AfterViewInit {
  private listaProfesionalesOriginales: any[] = [];
  profesionalesParaTabla: any[] = [];
  profesionalEnEdicion: any = null;
  modalRef: any;
  profesionalDetalle: any = null;
  mostrarModalDetalle: boolean = false;
  mostrarModalEliminar = false;
  mostrarModalNotificacion = false;
  mostrarModalError = false;
  profesionalAEliminar: any = null;
  mensajeNotificacion = '';
  mensajeError = '';
  formularioProfesional!: FormGroup;
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;
  filtroEspecialidad: string = '';
  filtroExperienciaMin: number = 0;
  filtroDisponibilidad: string | null = null;

  @ViewChild('modalProfesional') elementoModal!: ElementRef;

  constructor(
    private servicioProfesionales: ServProfesionalAPI,
    private constructorFormularios: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  public cargarDatosIniciales(): void {
    this.cargarProfesionales();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.elementoModal.nativeElement);
  }

  public inicializarFormulario() {
    this.formularioProfesional = this.constructorFormularios.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      especialidad: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]],
      oficios: ['', [Validators.minLength(3)]],
      experiencia: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      disponibilidad: [true],
    });
  }

  public guardarProfesional() {
    if (this.formularioProfesional.invalid) {
      this.formularioProfesional.markAllAsTouched();
      return;
    }

    const datosFormulario = this.formularioProfesional.value;
    const datosParaServidor = this.prepararDatosParaGuardar(datosFormulario);

    if (this.profesionalEnEdicion?.id) {
      this.ejecutarActualizacion(this.profesionalEnEdicion.id, datosParaServidor);
    } else {
      this.ejecutarCreacion(datosParaServidor);
    }
  }

  public prepararDatosParaGuardar(datos: any): any {
    return {
      ...datos,
      oficios: datos.oficios
        ? datos.oficios
            .split(',')
            .map((oficio: string) => oficio.trim())
            .filter(Boolean)
        : [],
      experiencia: Number(datos.experiencia),
    };
  }

  public ejecutarCreacion(datos: any) {
    this.servicioProfesionales.crear(datos).subscribe({
      next: () => {
        this.cargarProfesionales();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Profesional creado correctamente');
      },
      error: (error) => {
        console.error('Error al crear profesional:', error);
        this.mostrarError('Error al crear profesional');
      },
    });
  }

  public ejecutarActualizacion(id: number, datos: any) {
    this.servicioProfesionales.actualizar(id, datos).subscribe({
      next: () => {
        this.cargarProfesionales();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Profesional actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar profesional:', error);
        this.mostrarError('Error al actualizar profesional');
      },
    });
  }

  public cargarProfesionales() {
    this.servicioProfesionales.obtenerTodos().subscribe({
      next: (datosCrudos) => {
        this.listaProfesionalesOriginales = datosCrudos;
        this.formatearDatosParaTabla();
      },
      error: (error) => {
        console.error('Error al cargar profesionales:', error);
        this.mostrarError('Error al cargar profesionales');
      },
    });
  }

  public formatearDatosParaTabla() {
    let profesionalesAMostrar = [...this.listaProfesionalesOriginales];

    if (this.filtroEspecialidad) {
      const filtroLower = this.filtroEspecialidad.toLowerCase();
      profesionalesAMostrar = profesionalesAMostrar.filter((profesional) =>
        profesional.especialidad?.toLowerCase().includes(filtroLower)
      );
    }

    if (this.filtroExperienciaMin > 0) {
      profesionalesAMostrar = profesionalesAMostrar.filter(
        (profesional) => profesional.experiencia >= this.filtroExperienciaMin
      );
    }

    if (this.filtroDisponibilidad !== null) {
      const estaDisponible = this.filtroDisponibilidad === 'true';
      profesionalesAMostrar = profesionalesAMostrar.filter(
        (profesional) => profesional.disponibilidad === estaDisponible
      );
    }

    this.profesionalesParaTabla = profesionalesAMostrar.map((profesional) => ({
      id: profesional.id,
      nombre: profesional.nombre,
      especialidad: profesional.especialidad,
      email: profesional.email,
      telefono: profesional.telefono,
      oficiosFormateados: Array.isArray(profesional.oficios)
        ? profesional.oficios.join(', ')
        : profesional.oficios || 'No especificados',
      experienciaFormateada: `${profesional.experiencia} años`,
      disponibilidadFormateada: profesional.disponibilidad ? 'Sí' : 'No',
      datosCompletos: profesional,
    }));

    this.calcularPaginacion();
  }

  public buscarProfesionales(elementoInput: HTMLInputElement) {
    const terminoBusqueda = elementoInput.value.trim();

    if (!terminoBusqueda) {
      this.formatearDatosParaTabla();
      this.paginaActual = 1;
      return;
    }

    this.servicioProfesionales.buscar(terminoBusqueda).subscribe({
      next: (resultadosBusqueda) => {
        this.listaProfesionalesOriginales = resultadosBusqueda;
        this.formatearDatosParaTabla();
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.mostrarError('Error al buscar profesionales');
      },
    });
  }

  public aplicarFiltros(): void {
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  public limpiarFiltros(): void {
    this.filtroEspecialidad = '';
    this.filtroExperienciaMin = 0;
    this.filtroDisponibilidad = null;
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  public get obtenerProfesionalesPaginados(): any[] {
    const indiceInicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const indiceFin = indiceInicio + this.itemsPorPagina;
    return this.profesionalesParaTabla.slice(indiceInicio, indiceFin);
  }

  public calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.profesionalesParaTabla.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    }
  }

  public cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  public get obtenerRangoRegistros(): string {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(
      this.paginaActual * this.itemsPorPagina,
      this.profesionalesParaTabla.length
    );
    return `${inicio}-${fin} de ${this.profesionalesParaTabla.length}`;
  }

  public abrirNuevo() {
    this.profesionalEnEdicion = null;
    this.formularioProfesional.reset({
      experiencia: 0,
      disponibilidad: true,
    });
    this.modalRef.show();
  }

  public abrirEdicion(datosProfesional: any) {
    this.profesionalEnEdicion = { ...datosProfesional.datosCompletos };
    this.formularioProfesional.patchValue({
      ...datosProfesional.datosCompletos,
      oficios: Array.isArray(datosProfesional.datosCompletos.oficios)
        ? datosProfesional.datosCompletos.oficios.join(', ')
        : datosProfesional.datosCompletos.oficios || '',
    });
    this.modalRef.show();
  }

  public abrirModalEliminar(profesional: any) {
    this.profesionalAEliminar = profesional.datosCompletos;
    this.mostrarModalEliminar = true;
  }

  public confirmarEliminacion() {
    if (!this.profesionalAEliminar?.id) return;

    this.servicioProfesionales.eliminar(this.profesionalAEliminar.id).subscribe({
      next: () => {
        this.mostrarNotificacion('Profesional eliminado correctamente');
        this.cargarProfesionales();
        this.cerrarModalEliminar();
      },
      error: (error) => {
        console.error('Error al eliminar profesional:', error);
        this.mostrarError('Error al eliminar profesional');
        this.cerrarModalEliminar();
      },
    });
  }

  public cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.profesionalAEliminar = null;
  }

  public cerrarModalPrincipal() {
    this.modalRef.hide();
  }

  public verDetalle(profesional: any) {
    this.profesionalDetalle = profesional.datosCompletos;
    this.mostrarModalDetalle = true;
  }

  public cerrarDetalle() {
    this.mostrarModalDetalle = false;
    this.profesionalDetalle = null;
  }

  public mostrarNotificacion(mensaje: string) {
    this.mensajeNotificacion = mensaje;
    this.mostrarModalNotificacion = true;
    setTimeout(() => {
      this.mostrarModalNotificacion = false;
    }, 3000);
  }

  public mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    this.mostrarModalError = true;
    setTimeout(() => {
      this.mostrarModalError = false;
    }, 3000);
  }
}