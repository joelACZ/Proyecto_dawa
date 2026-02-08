import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServResenasJson } from '../../services/resena-service';
import { ServClientesJson } from '../../services/cliente-service'; // Importado para cargar clientes
import { ServServiciosJson } from '../../services/servicio-service';
import { Router, RouterModule } from '@angular/router';

import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';

import { ServResenaAPI } from '../../services/resena-service-API';
import { ServServicioAPI } from '../../services/servicio-service-API';
import { ServClientesAPI } from '../../services/cliente-service-API';
import { forkJoin } from 'rxjs';

import { DetailModal } from '../shared/detail-modal/detail-modal'; 
declare const bootstrap: any;

@Component({
  selector: 'app-crud-resenas',
  standalone: true,
  templateUrl: './crud-resenas.html',
  styleUrls: ['./crud-resenas.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal,    
    RouterModule],
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
  clientes: any[] = []; // Cambiado de solicitudes a clientes
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
    private servicioResenas: ServResenaAPI,
    private servicioClientes: ServClientesAPI, // Inyectado para el nuevo modelo
    private constructorFormularios: FormBuilder,
    private servicioServicios: ServServicioAPI, 
    private router: Router
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDatosIniciales();
    this.cargarClientes(); // Cargar clientes en lugar de solicitudes
    this.cargarServicios();
  }

  ngAfterViewInit() {
    if (this.elementoModal) {
      this.modalRef = new bootstrap.Modal(this.elementoModal.nativeElement);
    }
  }
public cargarDatosIniciales(): void {
  // Espera a que ambas peticiones terminen antes de formatear
  forkJoin({
    servicios: this.servicioServicios.obtenerTodos(),
    resenas: this.servicioResenas.obtenerTodas(),
    clientes: this.servicioClientes.obtenerTodos()
  }).subscribe({
    next: (resultado) => {
      this.servicios = resultado.servicios;
      this.clientes = resultado.clientes;
      this.listaResenasOriginales = resultado.resenas;
      this.formatearDatosParaTabla(); // Ahora sí, los servicios ya existen
    },
    error: (err) => this.mostrarError('Error al cargar datos')
  });
}
  public cargarServicios() {
    this.servicioServicios.obtenerTodos().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
      },
      error: (error) => console.error('Error al cargar servicios:', error)
    });
  }

  public cargarClientes() {
    this.servicioClientes.obtenerTodos().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => console.error('Error al cargar clientes:', error)
    });
  }

  public inicializarFormulario() {
    this.formResena = this.constructorFormularios.group({
      servicio_id: ['', [Validators.required]], // Cambiado a servicio_id
      cliente_id: ['', [Validators.required]],  // Nuevo campo cliente_id
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
    id: this.resenaEnEdicion?.id ? Number(this.resenaEnEdicion.id) : 0, // Incluir ID
    servicio_id: Number(datos.servicio_id), // Cambiar String por Number
    cliente_id: Number(datos.cliente_id),   // Cambiar String por Number
    calificacion: Number(datos.calificacion),
    comentario: datos.comentario,
    fecha: datos.fecha, 
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
      error: (error) => this.mostrarError('Error al crear reseña')
    });
  }

  public ejecutarActualizacion(id: number, datos: any) {
    this.servicioResenas.actualizar(id, datos).subscribe({
      next: () => {
        this.cargarResenas();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Reseña actualizada correctamente');
      },
      error: (error) => this.mostrarError('Error al actualizar reseña')
    });
  }

  public cargarResenas() {
    this.servicioResenas.obtenerTodas().subscribe({
      next: (datosCrudos) => {
        this.listaResenasOriginales = datosCrudos;
        this.formatearDatosParaTabla();
      },
      error: (error) => this.mostrarError('Error al cargar reseñas')
    });
  }

  public navegarAListaResenas(): void {
    this.router.navigate(['/resena-list']);
  }

  public formatearDatosParaTabla() {
    let resenasAMostrar = [...this.listaResenasOriginales];

    // Aplicar filtros existentes
    if (this.filtroCalificacion) {
      const filtro = Number(this.filtroCalificacion);
      resenasAMostrar = resenasAMostrar.filter(resena => resena.calificacion === filtro);
    }

    this.resenasParaTabla = resenasAMostrar.map(resena => {
      // Buscar nombre del servicio directamente por ID
      const servicio = this.servicios.find(s => String(s.id) === String(resena.servicio_id));
      
      return {
        id: resena.id,
        servicio_nombre: servicio?.nombre || 'Servicio no encontrado',
        calificacionFormateada: '⭐'.repeat(resena.calificacion),
        comentario: resena.comentario,
        fecha: new Date(resena.fecha).toLocaleDateString('es-ES'),
        anonimaFormateada: resena.anonima ? 'Sí' : 'No',
        datosCompletos: resena
      };
    });

    this.calcularPaginacion();
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
  }

  public cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  public abrirNuevo() {
    this.resenaEnEdicion = null;
    this.formResena.reset({
      calificacion: '',
      anonima: false,
      fecha: new Date().toISOString().split('T')[0]
    });
    if (this.modalRef) this.modalRef.show();
  }

  public abrirEdicion(datosResena: any) {
    this.resenaEnEdicion = { ...datosResena.datosCompletos };
    this.formResena.patchValue({
      ...datosResena.datosCompletos,
      fecha: new Date(datosResena.datosCompletos.fecha).toISOString().split('T')[0]
    });
    if (this.modalRef) this.modalRef.show();
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
      error: (error) => this.cerrarModalEliminar()
    });
  }

  public cerrarModalEliminar() { this.mostrarModalEliminar = false; }
  public cerrarModalPrincipal() { if (this.modalRef) this.modalRef.hide(); }
  public verDetalle(resena: any) { this.resenaDetalle = resena.datosCompletos; this.mostrarModalDetalle = true; }
  public cerrarDetalle() { this.mostrarModalDetalle = false; }

  public mostrarNotificacion(mensaje: string) {
    this.mensajeNotificacion = mensaje;
    this.mostrarModalNotificacion = true;
    setTimeout(() => this.mostrarModalNotificacion = false, 3000);
  }

  public mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    this.mostrarModalError = true;
    setTimeout(() => this.mostrarModalError = false, 3000);
  }
}