import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/Cliente.model';
import { ServClientesJson } from '../../services/cliente-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';


@Component({
  selector: 'app-cliente-crud',
  templateUrl: './crud-clientes.html',
  styleUrls: ['./crud-clientes.css'],
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, CardComponent],
})
export class CrudClientes {
  clientes: Cliente[] = [];
  
  // Formulario reactivo
  formCliente!: FormGroup;
  editingId: number | null = null;
  showModal: boolean = false;

  // Columnas de la tabla reutilizable
  columns = [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'email', header: 'Email' },
    { field: 'telefono', header: 'Teléfono' }
  ];

  constructor(
    private servClientes: ServClientesJson, 
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loadClientes();
    this.initForm();
  }

  // Inicializar formulario reactivo
  initForm() {
    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: [''],
      preferencias: [''],
      notificaciones: [false]
    });
  }

  // Cargar lista
  loadClientes() {
    this.servClientes.getClientes().subscribe((data) => {
      this.clientes = data;
    });
  }

  // Visualizar id - CORREGIDO: Manejo de error si la ruta no existe
  view(id: number | undefined) {
    if (id) {
      // Verificar si la ruta existe antes de navegar
      this.router.navigate(['/cliente-view', id]).catch(() => {
        console.warn(`La ruta '/cliente-view' no está configurada`);
        alert('La funcionalidad de vista detallada no está disponible');
      });
    }
  }

  // Buscar cliente
  search(input: HTMLInputElement) {
    const param = input.value;
    this.servClientes.searchClientes(param).subscribe((data) => {
      this.clientes = data;
    });
  }

  // Abrir modal para nuevo cliente
  openNew() {
    this.editingId = null;
    this.formCliente.reset();
    this.showModal = true;
  }

  // Abrir modal para editar cliente
  openEdit(cliente: Cliente) {
    this.editingId = cliente.id;
    this.formCliente.patchValue({
      ...cliente,
      preferencias: Array.isArray(cliente.preferencias) ? cliente.preferencias.join(', ') : cliente.preferencias
    });
    this.showModal = true;
  }

  // Cerrar modal
  closeModal() {
    this.showModal = false;
    this.formCliente.reset();
  }

  // Guardar (crear o actualizar)
  save() {
    if (this.formCliente.invalid) {
      alert('Por favor complete los campos requeridos correctamente');
      return;
    }

    const formData = this.formCliente.value;
    
    // Convertir preferencias de string a array
    const datos = {
      ...formData,
      preferencias: formData.preferencias ? 
        formData.preferencias.split(',').map((p: string) => p.trim()).filter((p: string) => p !== '') 
        : []
    };

    if (this.editingId) {
      // Actualizar
      const actualizado: Cliente = { ...datos, id: this.editingId };
      this.servClientes.update(actualizado).subscribe(() => {
        this.closeModal();
        this.loadClientes();
        alert('Cliente actualizado exitosamente');
      });
    } else {
      // Crear nuevo
      this.servClientes.create(datos).subscribe(() => {
        this.closeModal();
        this.loadClientes();
        alert('Cliente creado exitosamente');
      });
    }
  }

  // Eliminar
  delete(cliente: Cliente) {
    if (!confirm(`¿Eliminar a ${cliente.nombre}?`)) return;

    this.servClientes.delete(cliente.id).subscribe(() => {
      this.loadClientes();
      alert('Cliente eliminado exitosamente');
    });
  }
}

