import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Servicio } from '../../models/Servicio.model';
import { ServServiciosJson } from '../../services/servicio-service';
import { DataTableComponent } from "../data-table/data-table";
import { CardComponent } from "../cards/cards";

@Component({
  selector: 'app-servicio-crud',
  templateUrl: './crud-servicios.html',
  styleUrls: ['./crud-servicios.css'],
  imports: [DataTableComponent, CardComponent],
})
export class CrudServicios {
  
  servicios: Servicio[] = [];
  servicioEdit: Servicio | null = null;

  // 🔹 Columnas de la tabla reutilizable
  columns = [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'descripcion', header: 'Descripción' }
  ];

  constructor(
    private servServicios: ServServiciosJson,
    private router: Router
  ) {
    this.loadServicios();
  }

  // Cargar lista
  loadServicios() {
    this.servServicios.getServicios().subscribe((data) => {
      this.servicios = data;
    });
  }

  // Visualizar por ID
  view(id: number | undefined) {
    if (id) {
      this.router.navigate(['/servicio-view/', id]);
    }
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
    if (!confirm('¿Eliminar el servicio ${servicio.nombre}?')) return;
    
    this.servServicios.delete(servicio.id).subscribe(() => {
      this.loadServicios();
});
}
}