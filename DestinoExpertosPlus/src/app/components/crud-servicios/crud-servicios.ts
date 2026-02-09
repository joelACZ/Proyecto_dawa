import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Componentes compartidos
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';

// Servicios y Modelos
import { ServServicioAPI } from '../../services/servicio-service-API';
import { ServProfesionalAPI } from '../../services/profesionales-service-API';
import { ServCategoriasAPI, Categoria } from '../../services/categoria-service-Api';
import { Servicio } from '../../models/Servicio.model';
 

declare const bootstrap: any;

@Component({
  selector: 'app-crud-servicios',
  standalone: true,
  templateUrl: './crud-servicios.html',
  styleUrls: ['./crud-servicios.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DataTableComponent,
    CardComponent,
    DetailModal
  ],
})
export class CrudServicios implements OnInit, AfterViewInit {
  // Datos
  public listaServiciosOriginales: Servicio[] = [];
  public serviciosFiltrados: Servicio[] = [];
  public servicioEnEdicion: Servicio | null = null;
  public servicioDetalle: Servicio | null = null;
  public servicioAEliminar: Servicio | null = null;

  // Formulario y UI
  public formularioServicio!: FormGroup;
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
  public filtroBusqueda = '';
  public filtroCategoria = '';
  public profesionales: any[] = [];
  public categorias: Categoria[] = [];

  @ViewChild('modalServicio') elementoModal!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private srvServicios: ServServicioAPI,
    private srvProfesionales: ServProfesionalAPI,
    private srvCategorias: ServCategoriasAPI
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  ngAfterViewInit() {
    if (this.elementoModal) {
      this.modalRef = new bootstrap.Modal(this.elementoModal.nativeElement);
    }
  }

  private inicializarFormulario() {
    this.formularioServicio = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      precioBase: [0, [Validators.required, Validators.min(0)]],
      duracionEstimada: [60, [Validators.required, Validators.min(1)]],
      profesional_id: [''],
      activo: [true],
    });
  }

  public cargarDatosIniciales() {
    this.cargarServicios();
    this.cargarProfesionales();
    this.cargarCategorias();
  }

  public cargarServicios() {
    this.srvServicios.obtenerTodos().subscribe({
      next: (datos) => {
        this.listaServiciosOriginales = datos;
        this.filtrarServicios();
      },
      error: (err) => {
        console.error(err);
        this.mostrarError('Error al cargar los servicios');
      }
    });
  }

  public cargarProfesionales() {
  this.srvProfesionales.obtenerTodos().subscribe({
    next: (datos) => {
      this.profesionales = datos;
      this.filtrarServicios(); 
    },
    error: (err) => {
      console.error(err);
      this.mostrarError('Error al cargar los profesionales');
    }
  });
}
  public cargarCategorias() {
    this.srvCategorias.obtenerTodas().subscribe({
      next: (datos) => {
        this.categorias = datos;
      },
      error: (err) => {
        console.error(err);
        this.mostrarError('Error al cargar las categorías');
      }
    });
  }

  public buscarServicios(event: any) {
    this.filtroBusqueda = event.target.value;
    this.filtrarServicios();
  }

  public filtrarServicios() {
    let filtrados = [...this.listaServiciosOriginales];

    if (this.filtroBusqueda) {
      const term = this.filtroBusqueda.toLowerCase();
      filtrados = filtrados.filter(s =>
        s.nombre.toLowerCase().includes(term) ||
        s.descripcion.toLowerCase().includes(term)
      );
    }

    if (this.filtroCategoria) {
      filtrados = filtrados.filter(s => s.categoria === this.filtroCategoria);
    }

    this.serviciosFiltrados = filtrados.map(s => {

    const profesional = this.profesionales.find(p => p.id === s.profesional_id);
    return {
      ...s,

      profesional_nombre: profesional ? profesional.nombre : 'Sin asignar'
    };
  });

  }

  public guardarServicio() {
    if (this.formularioServicio.invalid) {
      this.formularioServicio.markAllAsTouched();
      return;
    }

    const formValue = this.formularioServicio.value;
    const payload: any = {
      ...formValue,
      precioBase: Number(formValue.precioBase),
      duracionEstimada: Number(formValue.duracionEstimada),
      profesional_id: formValue.profesional_id ? Number(formValue.profesional_id) : null,
      id: this.servicioEnEdicion ? this.servicioEnEdicion.id : 0
    };

    if (this.servicioEnEdicion) {
      this.srvServicios.actualizar(this.servicioEnEdicion.id, payload).subscribe({
        next: () => this.finalizarGuardado('Servicio actualizado con éxito'),
        error: (err) => this.manejarErrorAPI(err)
      });
    } else {
      this.srvServicios.crear(payload).subscribe({
        next: () => this.finalizarGuardado('Servicio creado con éxito'),
        error: (err) => this.manejarErrorAPI(err)
      });
    }
  }

  private finalizarGuardado(mensaje: string) {
    this.mostrarNotificacion(mensaje);
    this.cargarServicios();
    this.modalRef.hide();
  }

  private manejarErrorAPI(err: any) {
    console.error('Error en la API:', err);
    const detalle = err.error?.title || err.error?.message || 'Datos inválidos';
    this.mostrarError(`Error al guardar: ${detalle}`);
  }

  public verDetalleServicio(service: any) {
  this.servicioDetalle = service;
  this.mostrarModalDetalle = true;
  }

  public abrirEdicion(servicio: Servicio) {
    this.servicioEnEdicion = servicio;
    this.formularioServicio.patchValue({
      ...servicio,
      profesional_id: servicio.profesional_id?.toString() || ''
    });
    this.modalRef.show();
  }

  public abrirNuevo() {
    this.servicioEnEdicion = null;
    this.formularioServicio.reset({
      precioBase: 0,
      duracionEstimada: 60,
      activo: true
    });
    this.modalRef.show();
  }

  public abrirModalEliminar(servicio: Servicio) {
    this.servicioAEliminar = servicio;
    this.mostrarModalEliminar = true;
  }

  public cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.servicioAEliminar = null;
  }

  public cerrarDetalle() { this.mostrarModalDetalle = false; }

  public confirmarEliminacion() {
    if (!this.servicioAEliminar) return;
    this.srvServicios.eliminar(this.servicioAEliminar.id).subscribe({
      next: () => {
        this.cargarServicios();
        this.mostrarModalEliminar = false;
        this.mostrarNotificacion('Servicio eliminado correctamente');
      },
      error: () => this.mostrarError('No se pudo eliminar el servicio')
    });
  }

  public cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.serviciosFiltrados.length / this.itemsPorPagina);
  }

  get obtenerServiciosPaginados(): Servicio[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.serviciosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
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
