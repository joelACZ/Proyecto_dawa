import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Servicio } from '../../models/Servicio.model';
import { ServServiciosJson } from '../../services/servicio-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../shared/cards/cards';
import { CATEGORIAS_SERVICIOS } from '../../models/categoria.model';
import { DetailModal } from '../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-servicio-crud',
  templateUrl: './crud-servicios.html',
  styleUrls: ['./crud-servicios.css'],
  imports: [
    DataTableComponent,
    CardComponent,
    ReactiveFormsModule,
    CommonModule,
    DetailModal
  ],
  standalone: true,
})
export class CrudServicios implements OnInit {

  servicios: Servicio[] = [];
  servicioEdit: Servicio | null = null;
  servicioView: Servicio | null = null;

  formServicio: FormGroup;

  showModal = false;
  showViewModal = false;

  editingId: number | null = null;

  categorias = CATEGORIAS_SERVICIOS;

  profesionales = [
    { id: 1, nombre: 'Profesional 1' },
    { id: 2, nombre: 'Profesional 2' },
    { id: 3, nombre: 'Profesional 3' }
  ];

  constructor(
    private servServicios: ServServiciosJson,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formServicio = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      precioBase: [0, [Validators.required, Validators.min(0)]],
      duracionEstimada: [0, [Validators.required, Validators.min(1)]],
      profesional_id: ['', Validators.required],
      activo: [true]
    });
  }

  ngOnInit() {
    this.loadServicios();
  }

  loadServicios() {
    this.servServicios.getServicios().subscribe(data => {
      this.servicios = data;
    });
  }

  create() {
    this.editingId = null;
    this.formServicio.reset({ activo: true });
    this.showModal = true;
  }

  openView(servicio: Servicio) {
    this.servicioView = servicio;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.servicioView = null;
  }

  view(id: number | undefined) {
    if (id) this.router.navigate(['/servicio-view/', id]);
  }

  search(input: HTMLInputElement) {
    const param = input.value.trim();

    if (param === '') {
      this.loadServicios();
      return;
    }

    this.servServicios.searchServicios(param).subscribe(data => {
      this.servicios = data;
    });
  }

  edit(servicio: Servicio) {
    this.servicioEdit = { ...servicio };
    this.editingId = servicio.id;

    this.formServicio.patchValue({
      ...servicio,
      profesional_id: servicio.profesional_id.toString()
    });

    this.showModal = true;
  }

  delete(servicio: Servicio) {
    if (!confirm(`¿Eliminar el servicio ${servicio.nombre}?`)) return;

    this.servServicios.delete(servicio.id).subscribe(() => {
      this.loadServicios();
    });
  }

  save() {
    if (this.formServicio.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const servicioData: Servicio = this.formServicio.value;

    if (this.editingId) {
      const actualizado: Servicio = { ...servicioData, id: this.editingId };
      this.servServicios.update(actualizado).subscribe(() => {
        this.closeModal();
        this.loadServicios();
      });
    } else {
      this.servServicios.create(servicioData).subscribe(() => {
        this.closeModal();
        this.loadServicios();
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.servicioEdit = null;
    this.formServicio.reset();
  }

  private markFormGroupTouched() {
    Object.values(this.formServicio.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  columns = [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'email', header: 'Email' },
    { field: 'telefono', header: 'Teléfono' }
  ];
}
