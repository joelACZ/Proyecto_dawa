import { Component } from '@angular/core';
import { Servicio } from '../../models/Servicio.model';
import { ServServiciosJson } from '../../services/servicio-service';

@Component({
  selector: 'app-servicio-crud',
  templateUrl: './crud-servicios.html',
  styleUrls: ['./crud-servicios.css'],
})
export class CrudServicios {
  
  servicios: Servicio[] = [];
  servicioEdit: Servicio | null = null;

  constructor(private servServicios: ServServiciosJson) {
    this.loadServicios();
  }

  // Cargar lista
  loadServicios() {
    this.servServicios.getServicios().subscribe((data) => {
      this.servicios = data;
    });
  }

  // Buscar servicio
  search(input: HTMLInputElement) {
    const param = input.value;
    this.servServicios.searchServicios(param).subscribe((data) => {
      this.servicios = data;
    });
  }

  // Crear nuevo
  create(form: any) {
    const nuevo: Servicio = form.value;

    this.servServicios.create(nuevo).subscribe(() => {
      form.reset();
      this.loadServicios();
    });
  }

  // Seleccionar servicio para editar
  edit(servicio: Servicio) {
    this.servicioEdit = { ...servicio };
  }

  // Guardar edición
  update(form: any) {
    if (!this.servicioEdit) return;

    const actualizado: Servicio = { ...this.servicioEdit, ...form.value };

    this.servServicios.update(actualizado).subscribe(() => {
      this.servicioEdit = null;
      form.reset();
      this.loadServicios();
    });
  }

  // Eliminar
  delete(servicio: Servicio) {
    if (!confirm(`¿Eliminar el servicio ${servicio.nombre}?`)) return;

    this.servServicios.delete(servicio.id).subscribe(() => {
      this.loadServicios();
    });
  }
}
