import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServClientesJson } from '../../services/cliente-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';
import { ServClientesAPI } from '../../services/cliente-service-API';

declare const bootstrap: any;

@Component({
  selector: 'app-crud-clientes',
  standalone: true,
  templateUrl: './crud-clientes.html',
  styleUrls: ['./crud-clientes.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, FormsModule, CommonModule, DetailModal],
})
export class CrudClientes implements OnInit {
  private listaClientesOriginales: any[] = [];
  clientesParaTabla: any[] = [];
  clienteEnEdicion: any = null;
  referenciaModal: any;

  clienteDetalle: any = null;
  mostrarModalDetalle: boolean = false;
  mostrarModalEliminar = false;
  mostrarModalNotificacion = false;
  mostrarModalError = false;
  clienteAEliminar: any = null;
  mensajeNotificacion = '';
  mensajeError = '';

  formularioCliente!: FormGroup;

  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;

  @ViewChild('clienteModal') elementoModal!: ElementRef;

  constructor(
    private servicioClientes: ServClientesAPI,
    private constructorFormularios: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarClientes();
  }

  ngAfterViewInit() {
    this.referenciaModal = new bootstrap.Modal(this.elementoModal.nativeElement);
  }

  private inicializarFormulario() {
    this.formularioCliente = this.constructorFormularios.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      direccion: [''],
      preferencias: [''],
      notificaciones: [false]
    });
  }

  public guardarCliente() {
    if (this.formularioCliente.invalid) {
      this.formularioCliente.markAllAsTouched();
      return;
    }

    const datosFormateados = this.prepararDatosParaGuardar(this.formularioCliente.value);

    if (this.clienteEnEdicion?.id) {
      this.ejecutarActualizacion(datosFormateados);
    } else {
      this.ejecutarCreacion(datosFormateados);
    }
  }

  private prepararDatosParaGuardar(datos: any): any {
    return {
      ...datos,
    preferencias: datos.preferencias ? datos.preferencias.toString() : ''
    };
  }

  private ejecutarCreacion(datos: any) {
    this.servicioClientes.crear(datos).subscribe({
      next: () => {
        this.cargarClientes();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Cliente creado correctamente');
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        this.mostrarError('Error al crear cliente');
      }
    });
  }

  private ejecutarActualizacion(datos: any) {
    const clienteActualizado = { ...this.clienteEnEdicion, ...datos };
    this.servicioClientes.actualizar(clienteActualizado.id, clienteActualizado).subscribe({
      next: () => {
        this.cargarClientes();
        this.cerrarModalPrincipal();
        this.mostrarNotificacion('Cliente actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar cliente:', error);
        this.mostrarError('Error al actualizar cliente');
      }
    });
  }

  private cargarClientes() {
    this.servicioClientes.obtenerTodos().subscribe({
      next: (datos) => {
        this.listaClientesOriginales = datos;
        this.procesarDatosParaTabla();
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.mostrarError('Error al cargar clientes');
      }
    });
  }

  private procesarDatosParaTabla() {
    this.clientesParaTabla = this.listaClientesOriginales.map(cliente => ({
      ...cliente,
      preferenciasFormateadas: this.formatearPreferencias(cliente.preferencias),
      notificacionesFormateada: cliente.notificaciones ? 'Sí' : 'No'
    }));
    this.calcularPaginacion();
  }

  private formatearPreferencias(preferencias: any): string {
    if (Array.isArray(preferencias)) {
      return preferencias.join(', ');
    }
    return preferencias || '';
  }

  public buscarClientes(inputElemento: HTMLInputElement) {
    const terminoBusqueda = inputElemento.value.trim().toLowerCase();
    if (!terminoBusqueda) {
      this.procesarDatosParaTabla();
      this.paginaActual = 1;
      return;
    }

    const resultadosFiltrados = this.listaClientesOriginales.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(terminoBusqueda) ||
      cliente.email?.toLowerCase().includes(terminoBusqueda)
    );

    this.clientesParaTabla = resultadosFiltrados.map(cliente => ({
      ...cliente,
      preferenciasFormateadas: this.formatearPreferencias(cliente.preferencias),
      notificacionesFormateada: cliente.notificaciones ? 'Sí' : 'No'
    }));
    
    this.calcularPaginacion();
    this.paginaActual = 1;
  }

  public get obtenerClientesPaginados(): any[] {
    const indiceInicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const indiceFin = indiceInicio + this.itemsPorPagina;
    return this.clientesParaTabla.slice(indiceInicio, indiceFin);
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.clientesParaTabla.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    }
  }

  public cambiarPagina(numeroPagina: number): void {
    if (numeroPagina >= 1 && numeroPagina <= this.totalPaginas) {
      this.paginaActual = numeroPagina;
    }
  }

  public get obtenerRangoRegistros(): string {
    const indiceInicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const indiceFin = Math.min(this.paginaActual * this.itemsPorPagina, this.clientesParaTabla.length);
    return `${indiceInicio}-${indiceFin} de ${this.clientesParaTabla.length}`;
  }

  public abrirModalNuevo() {
    this.clienteEnEdicion = null;
    this.formularioCliente.reset({ notificaciones: false });
    this.mostrarModalPrincipal();
  }

  public abrirModalEdicion(cliente: any) {
    this.clienteEnEdicion = { ...cliente };
    this.formularioCliente.patchValue({
      ...cliente,
      preferencias: Array.isArray(cliente.preferencias) 
        ? cliente.preferencias.join(', ') 
        : cliente.preferencias
    });
    this.mostrarModalPrincipal();
  }

  private mostrarModalPrincipal() {
    this.referenciaModal.show();
  }

  public cerrarModalPrincipal() {
    this.referenciaModal.hide();
    this.clienteEnEdicion = null;
  }

  public abrirModalEliminacion(cliente: any) {
    this.clienteAEliminar = cliente;
    this.mostrarModalEliminar = true;
  }

  public confirmarEliminacion() {
    if (!this.clienteAEliminar?.id) return;

    this.servicioClientes.eliminar(this.clienteAEliminar.id).subscribe({
      next: () => {
        this.mostrarNotificacion('Cliente eliminado correctamente');
        this.cargarClientes();
        this.cerrarModalEliminacion();
      },
      error: (error) => {
        console.error('Error al eliminar cliente:', error);
        this.mostrarError('Error al eliminar cliente');
        this.cerrarModalEliminacion();
      }
    });
  }

  public cerrarModalEliminacion() {
    this.mostrarModalEliminar = false;
    this.clienteAEliminar = null;
  }

  public verDetalleCliente(cliente: any) {
    this.clienteDetalle = cliente;
    this.mostrarModalDetalle = true;
  }

  public cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.clienteDetalle = null;
  }

  private mostrarNotificacion(texto: string) {
    this.mensajeNotificacion = texto;
    this.mostrarModalNotificacion = true;
    setTimeout(() => {
      this.mostrarModalNotificacion = false;
    }, 3000);
  }

  private mostrarError(texto: string) {
    this.mensajeError = texto;
    this.mostrarModalError = true;
    setTimeout(() => {
      this.mostrarModalError = false;
    }, 3000);
  }
}