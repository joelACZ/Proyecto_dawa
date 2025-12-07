// crud-servicios.component.ts - REFACTORIZADO SEGÚN ARQUITECTURA SOLICITADA
import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServServiciosJson } from '../../services/servicio-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';
import { CATEGORIAS_SERVICIOS } from '../../models/categoria.model';

declare const bootstrap: any;

@Component({
  selector: 'app-crud-servicios',
  standalone: true,
  templateUrl: './crud-servicios.html',
  styleUrls: ['./crud-servicios.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal],
})
export class CrudServicios implements OnInit, AfterViewInit {
  private listaServiciosOriginales: any[] = []; // CACHE INTERNO - Datos crudos del servidor
  serviciosParaTabla: any[] = []; // Datos transformados para la vista
  servicioEnEdicion: any = null; // Estado temporal para edición
  modalRef: any;
  servicioDetalle: any = null;
  mostrarModalDetalle: boolean = false;
  mostrarModalEliminar = false;
  mostrarModalNotificacion = false;
  mostrarModalError = false;
  servicioAEliminar: any = null;
  mensajeNotificacion = '';
  mensajeError = '';
  formularioServicio!: FormGroup;
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;
  filtroCategoria: string = '';
  filtroActivo: string | null = null;
  @ViewChild('modalServicio') elementoModal!: ElementRef;
  profesionales: any[] = [];
  categorias = CATEGORIAS_SERVICIOS;
  
  constructor(
    private servicioServicios: ServServiciosJson,
    private constructorFormularios: FormBuilder
  ) {
    this.inicializarFormulario();
  }
  
  ngOnInit() {
    this.cargarDatosIniciales();
  }
  
  public cargarDatosIniciales(): void {
    this.cargarServicios();
  }
  
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.elementoModal.nativeElement);
  }
  
  public inicializarFormulario() {
    this.formularioServicio = this.constructorFormularios.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      precioBase: [0, [Validators.required, Validators.min(0)]],
      duracionEstimada: [0, [Validators.required, Validators.min(1)]],
      profesional_id: ['', Validators.required],
      activo: [true]
    });
  }
  
  public guardarServicio() {
    if (this.formularioServicio.invalid) {
      this.formularioServicio.markAllAsTouched();
      return;
    }
    
    const datosFormulario = this.formularioServicio.value;
    const datosParaServidor = this.prepararDatosParaGuardar(datosFormulario);
    
    if (this.servicioEnEdicion?.id) {
      this.ejecutarActualizacion(this.servicioEnEdicion.id, datosParaServidor);
    } else {
      this.ejecutarCreacion(datosParaServidor);
    }
  }
  
  public prepararDatosParaGuardar(datos: any): any {
    return {
      ...datos,
      precioBase: Number(datos.precioBase),
      duracionEstimada: Number(datos.duracionEstimada),
      profesional_id: Number(datos.profesional_id)
    };
  }
  
  public ejecutarCreacion(datos: any) {
    this.servicioServicios.crear(datos).subscribe({
      next: () => {
        this.cargarServicios();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Servicio creado correctamente');
      },
      error: (error) => {
        console.error('Error al crear servicio:', error);
        this.mostrarError('Error al crear servicio');
      }
    });
  }
  
  public ejecutarActualizacion(id: number, datos: any) {
    this.servicioServicios.actualizar(id, datos).subscribe({
      next: () => {
        this.cargarServicios();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Servicio actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar servicio:', error);
        this.mostrarError('Error al actualizar servicio');
      }
    });
  }
  
  public cargarServicios() {
    this.servicioServicios.obtenerTodos().subscribe({
      next: (datosCrudos) => {
        this.listaServiciosOriginales = datosCrudos;
        this.formatearDatosParaTabla();
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.mostrarError('Error al cargar servicios');
      }
    });
  }
  
  public formatearDatosParaTabla() {
    let serviciosAMostrar = [...this.listaServiciosOriginales];
    
    if (this.filtroCategoria) {
      serviciosAMostrar = serviciosAMostrar.filter(servicio =>
        servicio.categoria === this.filtroCategoria
      );
    }
    
    if (this.filtroActivo !== null) {
      const estaActivo = this.filtroActivo === 'true';
      serviciosAMostrar = serviciosAMostrar.filter(servicio =>
        servicio.activo === estaActivo
      );
    }
    
    this.serviciosParaTabla = serviciosAMostrar.map(servicio => ({
      id: servicio.id,
      nombre: servicio.nombre,
      categoria: servicio.categoria,
      descripcion: servicio.descripcion,
      descripcionCorta: servicio.descripcion.length > 50 
        ? servicio.descripcion.substring(0, 50) + '...' 
        : servicio.descripcion,
      precioBase: servicio.precioBase,
      precioBaseFormateado: `$${servicio.precioBase.toFixed(2)}`,
      duracionEstimada: servicio.duracionEstimada,
      duracionFormateada: `${servicio.duracionEstimada} min`,
      profesional_id: servicio.profesional_id,
      profesionalNombre: this.obtenerNombreProfesional(servicio.profesional_id),
      activo: servicio.activo,
      activoFormateado: servicio.activo ? 'Sí' : 'No',
      datosCompletos: servicio // Mantenemos referencia a datos originales
    }));
    
    this.calcularPaginacion();
  }
  
  private obtenerNombreProfesional(profesionalId: number): string {
    // Esto se implementaría si tuvieras el servicio de profesionales
    return 'Profesional ' + profesionalId;
  }
  
  public buscarServicios(elementoInput: HTMLInputElement) {
    const terminoBusqueda = elementoInput.value.trim();
    
    if (!terminoBusqueda) {
      this.formatearDatosParaTabla();
      this.paginaActual = 1;
      return;
    }
    
    this.servicioServicios.buscar(terminoBusqueda).subscribe({
      next: (resultadosBusqueda) => {
        this.listaServiciosOriginales = resultadosBusqueda;
        this.formatearDatosParaTabla();
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.mostrarError('Error al buscar servicios');
      }
    });
  }
  
  public aplicarFiltros(): void {
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }
  
  public limpiarFiltros(): void {
    this.filtroCategoria = '';
    this.filtroActivo = null;
    this.paginaActual = 1;
    this.formatearDatosParaTabla();
  }
  
  public get obtenerServiciosPaginados(): any[] {
    const indiceInicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const indiceFin = indiceInicio + this.itemsPorPagina;
    return this.serviciosParaTabla.slice(indiceInicio, indiceFin);
  }
  
  public calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.serviciosParaTabla.length / this.itemsPorPagina);
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
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.serviciosParaTabla.length);
    return `${inicio}-${fin} de ${this.serviciosParaTabla.length}`;
  }
  
  public abrirNuevo() {
    this.servicioEnEdicion = null;
    this.formularioServicio.reset({
      precioBase: 0,
      duracionEstimada: 0,
      activo: true
    });
    this.modalRef.show();
  }
  
  public abrirEdicion(datosServicio: any) {
    this.servicioEnEdicion = { ...datosServicio.datosCompletos };
    this.formularioServicio.patchValue({
      ...datosServicio.datosCompletos,
      profesional_id: datosServicio.datosCompletos.profesional_id.toString()
    });
    this.modalRef.show();
  }
  
  public abrirModalEliminar(servicio: any) {
    this.servicioAEliminar = servicio.datosCompletos;
    this.mostrarModalEliminar = true;
  }
  
  public confirmarEliminacion() {
    if (!this.servicioAEliminar?.id) return;
    
    this.servicioServicios.eliminar(this.servicioAEliminar.id).subscribe({
      next: () => {
        this.mostrarNotificacion('Servicio eliminado correctamente');
        this.cargarServicios();
        this.cerrarModalEliminar();
      },
      error: (error) => {
        console.error('Error al eliminar servicio:', error);
        this.mostrarError('Error al eliminar servicio');
        this.cerrarModalEliminar();
      }
    });
  }
  
  public cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.servicioAEliminar = null;
  }
  
  public cerrarModalPrincipal() {
    this.modalRef.hide();
  }
  
  public verDetalle(servicio: any) {
    this.servicioDetalle = servicio.datosCompletos;
    this.mostrarModalDetalle = true;
  }
  
  public cerrarDetalle() {
    this.mostrarModalDetalle = false;
    this.servicioDetalle = null;
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