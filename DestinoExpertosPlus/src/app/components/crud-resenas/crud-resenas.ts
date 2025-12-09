import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServResenasJson } from '../../services/resena-service';
import { SolicitudService } from '../../services/solicitud-service';

import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';
import { ServServiciosJson } from '../../services/servicio-service';
import { Router } from '@angular/router';


declare const bootstrap: any;

@Component({
  selector: 'app-crud-resenas',
  standalone: true,
  templateUrl: './crud-resenas.html',
  styleUrls: ['./crud-resenas.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal, ],
})
export class CrudResenas implements OnInit, AfterViewInit {
  private listaResenasOriginales: any[] = [];
  resenasParaTabla: any[] = [];
  resenaEnEdicion: any = null;
  modalRef: any;
  resenaDetalle: any = null;
  mostrarModalDetalle: boolean = false;
  mostrarModalEliminar = false;
  mostrarModalNotificacion = false;
  mostrarModalError = false;
  resenaAEliminar: any = null;
  mensajeNotificacion = '';
  mensajeError = '';
  formResena!: FormGroup;
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;
  filtroCalificacion: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  solicitudes: any[] = [];
  servicios: any[] = [];

  opcionesFiltroCalificacion = [
    { valor: '', texto: 'Todas' },
    { valor: '5', texto: '5 Estrellas' },
    { valor: '4', texto: '4 Estrellas' },
    { valor: '3', texto: '3 Estrellas' },
    { valor: '2', texto: '2 Estrellas' },
    { valor: '1', texto: '1 Estrella' }
  ];

  opcionesCalificacion = [
    { valor: 5, texto: '5 Estrellas' },
    { valor: 4, texto: '4 Estrellas' },
    { valor: 3, texto: '3 Estrellas' },
    { valor: 2, texto: '2 Estrellas' },
    { valor: 1, texto: '1 Estrella' }
  ];

  @ViewChild('elementoModal') elementoModal!: ElementRef;

  constructor(
    private servicioResenas: ServResenasJson,
    private servicioSolicitudes: SolicitudService,
    private constructorFormularios: FormBuilder,
    private servicioServicios: ServServiciosJson, 
    private router: Router
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDatosIniciales();
    this.cargarSolicitudes();
    this.cargarServicios();

  }

  ngAfterViewInit() {
    if (this.elementoModal) {
      this.modalRef = new bootstrap.Modal(this.elementoModal.nativeElement);
    }
  }

  public cargarDatosIniciales(): void {
    this.cargarResenas();
  }



  public cargarServicios() {
  this.servicioServicios.obtenerTodos().subscribe({
    next: (servicios) => {
      this.servicios = servicios;
    },
    error: (error) => {
      console.error('Error al cargar servicios:', error);
    }
  });
}
  public inicializarFormulario() {
    this.formResena = this.constructorFormularios.group({
      solicitud_id: ['', [Validators.required]],
      calificacion: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      fecha: ['', [Validators.required]],
      anonima: [false]
    });
  }

  public guardarResena() {
    if (this.formResena.invalid) {
      this.formResena.markAllAsTouched();
      return;
    }
    const datosFormulario = this.formResena.value;
    const datosParaServidor = this.prepararDatosParaGuardar(datosFormulario);
    
    if (this.resenaEnEdicion?.id) {
      this.ejecutarActualizacion(this.resenaEnEdicion.id, datosParaServidor);
    } else {
      this.ejecutarCreacion(datosParaServidor);
    }
  }

  public prepararDatosParaGuardar(datos: any): any {
    return {
      ...datos,
      solicitud_id: Number(datos.solicitud_id),
      calificacion: Number(datos.calificacion),
      anonima: Boolean(datos.anonima)
    };
  }

  public ejecutarCreacion(datos: any) {
    this.servicioResenas.crear(datos).subscribe({
      next: () => {
        this.cargarResenas();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Reseña creada correctamente');
      },
      error: (error) => {
        console.error('Error al crear reseña:', error);
        this.mostrarError('Error al crear reseña');
      }
    });
  }

  public ejecutarActualizacion(id: number, datos: any) {
    this.servicioResenas.actualizar(id, datos).subscribe({
      next: () => {
        this.cargarResenas();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Reseña actualizada correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar reseña:', error);
        this.mostrarError('Error al actualizar reseña');
      }
    });
  }

  public cargarResenas() {
    this.servicioResenas.obtenerTodas().subscribe({
      next: (datosCrudos) => {
        this.listaResenasOriginales = datosCrudos;
        this.formatearDatosParaTabla();
      },
      error: (error) => {
        console.error('Error al cargar reseñas:', error);
        this.mostrarError('Error al cargar reseñas');
      }
    });
  }

  public cargarSolicitudes() {
    this.servicioSolicitudes.obtenerTodas().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
        console.log('Solicitudes cargadas:', this.solicitudes);
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
      }
    });
  }

  public navegarAListaResenas(): void {
    this.router.navigate(['/resena-list']);
  }
  public formatearDatosParaTabla() {
    let resenasAMostrar = [...this.listaResenasOriginales];

    if (this.filtroCalificacion) {
      const filtro = Number(this.filtroCalificacion);
      resenasAMostrar = resenasAMostrar.filter(resena => resena.calificacion === filtro);
    }

    if (this.filtroFechaInicio) {
      const fechaInicio = new Date(this.filtroFechaInicio);
      resenasAMostrar = resenasAMostrar.filter(resena => new Date(resena.fecha) >= fechaInicio);
    }

    if (this.filtroFechaFin) {
      const fechaFin = new Date(this.filtroFechaFin);
      fechaFin.setHours(23, 59, 59, 999);
      resenasAMostrar = resenasAMostrar.filter(resena => new Date(resena.fecha) <= fechaFin);
    }

    this.resenasParaTabla = resenasAMostrar.map(resena => ({
      id: resena.id,
      solicitud_id: resena.solicitud_id,
      calificacionFormateada: '⭐'.repeat(resena.calificacion),
      comentario: resena.comentario,
      fecha: new Date(resena.fecha).toLocaleDateString('es-ES'),
      anonimaFormateada: resena.anonima ? 'Sí' : 'No',
      datosCompletos: resena
    }));

    this.calcularPaginacion();
  }

  public buscarResenas(elementoInput: HTMLInputElement) {
    const terminoBusqueda = elementoInput.value.trim();
    if (!terminoBusqueda) {
      this.cargarResenas();
      this.paginaActual = 1;
      return;
    }
    this.servicioResenas.buscarPorTermino(terminoBusqueda).subscribe({
      next: (resultadosBusqueda) => {
        this.listaResenasOriginales = resultadosBusqueda;
        this.formatearDatosParaTabla();
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.mostrarError('Error al buscar reseñas');
      }
    });
  }

  public aplicarFiltros(): void {
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  public limpiarFiltros(): void {
    this.filtroCalificacion = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }

  public get resenasPaginadas(): any[] {
    const indiceInicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const indiceFin = indiceInicio + this.itemsPorPagina;
    return this.resenasParaTabla.slice(indiceInicio, indiceFin);
  }

  public calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.resenasParaTabla.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    }
  }

  public cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  public get rangoRegistros(): string {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.resenasParaTabla.length);
    return `${inicio}-${fin} de ${this.resenasParaTabla.length}`;
  }

  public abrirNuevo() {
    this.resenaEnEdicion = null;
    this.formResena.reset({
      calificacion: '',
      anonima: false,
      fecha: new Date().toISOString().split('T')[0]
    });
    if (this.modalRef) {
      this.modalRef.show();
    }
  }

  public abrirEdicion(datosResena: any) {
    this.resenaEnEdicion = { ...datosResena.datosCompletos };
    this.formResena.patchValue({
      ...datosResena.datosCompletos,
      fecha: new Date(datosResena.datosCompletos.fecha).toISOString().split('T')[0]
    });
    if (this.modalRef) {
      this.modalRef.show();
    }
  }

  public abrirModalEliminar(resena: any) {
    this.resenaAEliminar = resena.datosCompletos;
    this.mostrarModalEliminar = true;
  }

  public confirmarEliminacion() {
    if (!this.resenaAEliminar?.id) return;
    this.servicioResenas.eliminar(this.resenaAEliminar.id).subscribe({
      next: () => {
        this.mostrarNotificacion('Reseña eliminada correctamente');
        this.cargarResenas();
        this.cerrarModalEliminar();
      },
      error: (error) => {
        console.error('Error al eliminar reseña:', error);
        this.mostrarError('Error al eliminar reseña');
        this.cerrarModalEliminar();
      }
    });
  }

  public cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.resenaAEliminar = null;
  }

  public cerrarModalPrincipal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  public verDetalle(resena: any) {
    this.resenaDetalle = resena.datosCompletos;
    this.mostrarModalDetalle = true;
  }

  public cerrarDetalle() {
    this.mostrarModalDetalle = false;
    this.resenaDetalle = null;
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

  obtenerNombreServicio(servicioId: number): string {
  const servicio = this.servicios.find(s => s.id === servicioId);
  return servicio ? servicio.nombre : 'Sin servicio';
}
}