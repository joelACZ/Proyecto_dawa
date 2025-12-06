import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/Cliente.model';
import { ServClientesJson } from '../../services/cliente-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { Cards } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';

declare const bootstrap: any;

@Component({
  selector: 'app-cliente-crud',
  standalone: true,
  templateUrl: './crud-clientes.html',
  styleUrls: ['./crud-clientes.css'],
  imports: [
    CommonModule, ReactiveFormsModule, DataTableComponent, CardComponent, DetailModal],
  standalone: true,
})
export class CrudClientes implements OnInit {
  // ============================================
  // SECCIÓN 1: PROPIEDADES DE DATOS Y ESTADO
  // ============================================
  clientes: Cliente[] = [];
  clientesParaTabla: any[] = [];
  clienteEdit: Cliente | null = null;
  modalRef: any;

  // ============================================
  // SECCIÓN 2: PROPIEDADES DE MODALES
  // ============================================
  clienteDetalle: Cliente | null = null;
  showDetailModal: boolean = false;
  showDeleteModal = false;
  showNotificationModal = false;
  showErrorModal = false;
  cliente_a_Eliminar: Cliente | null = null;
  notificationMessage = '';
  errorMessage = '';

  // ============================================
  // SECCIÓN 3: PROPIEDADES DE FORMULARIO
  // ============================================
  formCliente!: FormGroup;

  // ============================================
  // SECCIÓN 4: PROPIEDADES DE PAGINACIÓN
  // ============================================
  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalPaginas: number = 1;

  // ============================================
  // SECCIÓN 5: OPCIONES Y CONFIGURACIONES
  // ============================================
  @ViewChild('clienteModal') modalElement!: ElementRef;

  // ============================================
  // SECCIÓN 6: CONSTRUCTOR E INICIALIZACIÓN
  // ============================================
  constructor(
    private servClientes: ServClientesJson,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    this.loadClientes();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  // ============================================
  // SECCIÓN 7: MÉTODOS DE FORMULARIO
  // ============================================
  inicializarFormulario() {
    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      direccion: [''],
      preferencias: [''],
      notificaciones: [false]
    });
  }

  save() {
    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      return;
    }

    const datos = {
      ...this.formCliente.value,
      preferencias: this.formCliente.value.preferencias
        ? this.formCliente.value.preferencias.split(',').map((p: string) => p.trim()).filter(Boolean)
        : []
    };

    if (this.clienteEdit?.id) {
      const updated: Cliente = { ...this.clienteEdit, ...datos };
      this.servClientes.update(updated).subscribe({
        next: () => {
          this.loadClientes();
          this.modalRef.hide();
          this.showNotification('Cliente actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar cliente:', err);
          this.showError('Error al actualizar cliente');
        }
      });
    } else {
      this.servClientes.create(datos as Cliente).subscribe({
        next: () => {
          this.loadClientes();
          this.modalRef.hide();
          this.showNotification('Cliente creado correctamente');
        },
        error: (err) => {
          console.error('Error al crear cliente:', err);
          this.showError('Error al crear cliente');
        }
      });
    }
  }

  // ============================================
  // SECCIÓN 8: MÉTODOS DE CARGA DE DATOS
  // ============================================
  loadClientes() {
    this.servClientes.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.formatearDatosParaTabla();
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.showError('Error al cargar clientes');
      }
    });
  }

  // ============================================
  // SECCIÓN 9: MÉTODOS DE TABLA Y FILTRADO
  // ============================================
  formatearDatosParaTabla() {
    this.clientesParaTabla = this.clientes.map(c => ({
      ...c,
      preferenciasFormateadas: Array.isArray(c.preferencias) 
        ? c.preferencias.join(', ') 
        : c.preferencias,
      notificacionesFormateada: c.notificaciones ? 'Sí' : 'No'
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

    this.servClientes.searchClientes(param).subscribe({
      next: (resultadosBusqueda) => {
        this.clientesParaTabla = resultadosBusqueda.map(c => ({
          ...c,
          preferenciasFormateadas: Array.isArray(c.preferencias) 
            ? c.preferencias.join(', ') 
            : c.preferencias,
          notificacionesFormateada: c.notificaciones ? 'Sí' : 'No'
        }));
        this.calcularPaginacion();
        this.paginaActual = 1;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.showError('Error al buscar clientes');
      }
    });
  }

  // ============================================
  // SECCIÓN 10: MÉTODOS DE PAGINACIÓN
  // ============================================
  get clientesPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.clientesParaTabla.slice(inicio, fin);
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.clientesParaTabla.length / this.itemsPorPagina);
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
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.clientesParaTabla.length);
    return `${inicio}-${fin} de ${this.clientesParaTabla.length}`;
  }

  // ============================================
  // SECCIÓN 11: MÉTODOS CRUD - CREAR/EDITAR
  // ============================================
  openNew() {
    this.clienteEdit = null;
    this.formCliente.reset({ notificaciones: false });
    this.modalRef.show();
  }

  openEdit(cliente: Cliente) {
    this.clienteEdit = { ...cliente };
    this.formCliente.patchValue({
      ...cliente,
      preferencias: Array.isArray(cliente.preferencias) 
        ? cliente.preferencias.join(', ') 
        : cliente.preferencias
    });
    this.modalRef.show();
  }

  // ============================================
  // SECCIÓN 12: MÉTODOS CRUD - ELIMINAR
  // ============================================
  openDeleteModal(cliente: Cliente) {
    this.cliente_a_Eliminar = cliente;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.cliente_a_Eliminar?.id) return;

    this.servClientes.delete(this.cliente_a_Eliminar.id).subscribe({
      next: () => {
        this.showNotification('Cliente eliminado correctamente');
        this.loadClientes();
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error al eliminar cliente:', err);
        this.showError('Error al eliminar cliente');
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.cliente_a_Eliminar = null;
  }

  // ============================================
  // SECCIÓN 13: MÉTODOS DE VISUALIZACIÓN/DETALLE
  // ============================================
  view(cliente: Cliente) {
    this.clienteDetalle = cliente;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.clienteDetalle = null;
  }

  // ============================================
  // SECCIÓN 14: MÉTODOS DE NOTIFICACIÓN Y ERROR
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