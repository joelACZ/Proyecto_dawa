import { Component } from '@angular/core';
import { Cliente } from '../../models/Cliente.model';
import { ServClientesJson } from '../../services/cliente-service';

@Component({
  selector: 'app-cliente-crud',
  templateUrl: './crud-clientes.html',
  styleUrls: ['./crud-clientes.css'],
})
export class CrudCliente {
  
  clientes: Cliente[] = [];
  clienteEdit: Cliente | null = null;

  constructor(private servClientes: ServClientesJson) {
    this.loadClientes();
  }

  // Cargar lista
  loadClientes() {
    this.servClientes.getClientes().subscribe((data) => {
      this.clientes = data;
    });
  }

  // Buscar cliente
  search(input: HTMLInputElement) {
    const param = input.value;
    this.servClientes.searchClientes(param).subscribe((data) => {
      this.clientes = data;
    });
  }

  // Crear nuevo
  create(form: any) {
    const nuevo: Cliente = form.value;

    this.servClientes.create(nuevo).subscribe(() => {
      form.reset();
      this.loadClientes();
    });
  }

  // Seleccionar cliente para editar
  edit(cliente: Cliente) {
    this.clienteEdit = { ...cliente };
  }

  // Guardar edición
  update(form: any) {
    if (!this.clienteEdit) return;

    const actualizado: Cliente = { ...this.clienteEdit, ...form.value };

    this.servClientes.update(actualizado).subscribe(() => {
      this.clienteEdit = null;
      form.reset();
      this.loadClientes();
    });
  }

  // Eliminar
  delete(cliente: Cliente) {
    if (!confirm(`¿Eliminar a ${cliente.nombre}?`)) return;

    this.servClientes.delete(cliente.id).subscribe(() => {
      this.loadClientes();
    });
  }
}
