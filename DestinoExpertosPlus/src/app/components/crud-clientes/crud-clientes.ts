import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../models/Cliente.model';
import { ServClientesJson } from '../../services/cliente-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { Cards } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';


@Component({
  selector: 'app-cliente-crud',
  templateUrl: './crud-clientes.html',
  styleUrls: ['./crud-clientes.css'],
  imports: [
    CommonModule, ReactiveFormsModule, DataTableComponent, Cards, DetailModal],
  standalone: true,
})
export class CrudClientes {
clientes: Cliente[] = [];
  formCliente!: FormGroup;
  editingId: number | null = null;


  clienteView: Cliente | null = null;
  showViewModal = false;


  showEditModal = false;

  columns = [
  { field: 'id', header: 'ID' },
  { field: 'nombre', header: 'Nombre' },
  { field: 'email', header: 'Email' },
  { field: 'telefono', header: 'Teléfono' },
  { field: 'direccion', header: 'Dirección' },
  { field: 'preferencias', header: 'Preferencias' },
  { field: 'notificaciones', header: 'Notificaciones' }
];


  constructor(
    private servClientes: ServClientesJson,
    private fb: FormBuilder
  ) {
    this.loadClientes();
    this.initForm();
  }

  initForm() {
    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.min(2)]],
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


  openView(c: Cliente) {
    this.clienteView = c;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.clienteView = null;
  }


  openNew() {
    this.editingId = null;
    this.formCliente.reset({ notificaciones: false });
    this.showEditModal = true;
  }

  openEdit(c: Cliente) {
    this.editingId = c.id || null;
    this.formCliente.patchValue({
      ...c,
      preferencias: Array.isArray(c.preferencias) ? c.preferencias.join(', ') : c.preferencias
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  save() {
    if (this.formCliente.invalid) return;

    const datos = {
      ...this.formCliente.value,
      preferencias: this.formCliente.value.preferencias
        ? this.formCliente.value.preferencias.split(',').map((p: string) => p.trim()).filter(Boolean)
        : []
    };

    if (this.editingId) {
      this.servClientes.update({ ...datos, id: this.editingId } as Cliente).subscribe(() => {
        this.closeEditModal();
        this.loadClientes();
      });
    } else {
      this.servClientes.create(datos as Cliente).subscribe(() => {
        this.closeEditModal();
        this.loadClientes();
      });
    }
  }

  delete(c: Cliente) {
    if (confirm(`¿Eliminar a ${c.nombre}?`)) {
      this.servClientes.delete(c.id!).subscribe(() => this.loadClientes());
    }
  }

  search(input: HTMLInputElement) {
    const q = input.value.trim();
    if (!q) this.loadClientes();
    else this.servClientes.searchClientes(q).subscribe(data => this.clientes = data);
  }

  
}
