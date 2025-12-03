import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/Cliente.model';
import { ServClientesJson } from '../../services/cliente-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';


@Component({
  selector: 'app-cliente-crud',
  templateUrl: './crud-clientes.html',
  styleUrls: ['./crud-clientes.css'],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    DataTableComponent, 
    CardComponent, 
    DetailModal],
  standalone: true, // Asegurar que sea standalone para las imports
})
export class CrudClientes {
  clientes: Cliente[] = [];
  formCliente!: FormGroup;
  editingId: number | null = null;

  // Control del modal de detalles REUTILIZABLE
  showViewModal = false;
  clienteView: Cliente | null = null;

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

  loadClientes() {
    this.servClientes.getClientes().subscribe(data => this.clientes = data);
  }

  // ---- ABRIR MODAL DE DETALLES (usando el componente reutilizable) ----
  openView(cliente: Cliente) {
    this.clienteView = cliente;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.clienteView = null;
  }

  // ---- Resto de métodos (new, edit, save, delete, search...) ----
  openNew() {
    this.editingId = null;
    this.formCliente.reset({ notificaciones: false });
    this.showModal = true;
  }

  openEdit(cliente: Cliente) {
    this.editingId = cliente.id || null;
    this.formCliente.patchValue({
      ...cliente,
      preferencias: Array.isArray(cliente.preferencias) ? cliente.preferencias.join(', ') : cliente.preferencias
    });
    this.showModal = true;
  }

  save() {
    if (this.formCliente.invalid) return alert('Complete los campos requeridos');

    const formData = this.formCliente.value;
    const datos = {
      ...formData,
      preferencias: formData.preferencias
        ? formData.preferencias.split(',').map((p: string) => p.trim()).filter(Boolean)
        : []
    };

    if (this.editingId) {
      this.servClientes.update({ ...datos, id: this.editingId }).subscribe(() => {
        this.closeModal();
        this.loadClientes();
        alert('Cliente actualizado');
      });
    } else {
      this.servClientes.create(datos).subscribe(() => {
        this.closeModal();
        this.loadClientes();
        alert('Cliente creado');
      });
    }
  }

  delete(cliente: Cliente) {
    if (!confirm(`¿Eliminar a ${cliente.nombre}?`)) return;
    this.servClientes.delete(cliente.id!).subscribe(() => {
      this.loadClientes();
      alert('Cliente eliminado');
    });
  }

  closeModal() {
    this.showModal = false;
  }

  // Variables para el modal de crear/editar (el que ya tenías)
  showModal = false;

  search(input: HTMLInputElement) {
    this.servClientes.searchClientes(input.value).subscribe(data => this.clientes = data);
  }
}