import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Servicio } from '../../models/Servicio.model';
import { ServServiciosJson } from '../../services/servicio-service';
import { DataTableComponent } from "../shared/data-table/data-table";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../shared/cards/cards';
import { CATEGORIAS_SERVICIOS } from '../../models/categoria.model';

@Component({
  selector: 'app-servicio-crud',
  templateUrl: './crud-servicios.html',
  styleUrls: ['./crud-servicios.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, CommonModule],
})
export class CrudServicios implements OnInit {
  
  servicios: Servicio[] = [];
  servicioEdit: Servicio | null = null;
  formServicio: FormGroup; // Corregido el nombre
  showModal: boolean = false; // Variable para controlar modal
  editingId: number | null = null; // ID del servicio en edición
  
  // Datos de ejemplo - reemplaza con tus datos reales
  categorias = CATEGORIAS_SERVICIOS;
  profesionales: any[] = [
    { id: 1, nombre: 'Profesional 1' },
    { id: 2, nombre: 'Profesional 2' },
    { id: 3, nombre: 'Profesional 3' }
  ];

  constructor(
    private servServicios: ServServiciosJson,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Inicializar formulario reactivo con todos los campos
    this.formServicio = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      precioBase: [0, [Validators.required, Validators.min(0)]],
      duracionEstimada: [0, [Validators.required, Validators.min(1)]],
      profesional_id: ['', [Validators.required]],
      activo: [true]
    });
  }

  ngOnInit() {
    this.loadServicios();
  }

  loadServicios() {
    this.servServicios.getServicios().subscribe((data) => {
      this.servicios = data;
    });
  }

  // Método para abrir modal de creación
  create() {
    this.editingId = null;
    this.formServicio.reset({ activo: true });
    this.showModal = true;
  }

  view(id: number | undefined) {
    if (id) this.router.navigate(['/servicio-view/', id]);
  }

  search(input: HTMLInputElement) {
    const param = input.value;
    if (param.trim() === '') {
      this.loadServicios();
    } else {
      this.servServicios.searchServicios(param).subscribe((data) => {
        this.servicios = data;
      });
    }
  }

  edit(servicio: Servicio) {
    this.servicioEdit = { ...servicio };
    this.editingId = servicio.id || null;
    this.formServicio.patchValue({
      ...servicio,
      profesional_id: servicio.profesional_id?.toString() || ''
    });
    this.showModal = true;
  }

  delete(servicio: Servicio) {
    if (!confirm(`¿Eliminar el servicio ${servicio.nombre}?`)) return;
    
    this.servServicios.delete(servicio.id).subscribe(() => {
      this.loadServicios();
    });
  }

  // Método para guardar (crear o actualizar)
  save() {
    if (this.formServicio.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const servicioData: Servicio = this.formServicio.value;

    if (this.editingId) {
      // Actualizar
      const actualizado: Servicio = {
        ...servicioData,
        id: this.editingId
      };
      this.servServicios.update(actualizado).subscribe(() => {
        this.closeModal();
        this.loadServicios();
      });
    } else {
      // Crear
      this.servServicios.create(servicioData).subscribe(() => {
        this.closeModal();
        this.loadServicios();
      });
    }
  }

  // Método para cerrar modal
  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.servicioEdit = null;
    this.formServicio.reset();
  }

  // Método para marcar todos los campos como touched
  private markFormGroupTouched() {
    Object.keys(this.formServicio.controls).forEach(key => {
      const control = this.formServicio.get(key);
      control?.markAsTouched();
    });
  }
}