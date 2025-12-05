import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Profesional } from '../../models/Profesional.model';
import { ServProfesionalesJson } from '../../services/profesionales-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-crud-profesionales',
  templateUrl: './crud-profesionales.html',
  styleUrls: ['./crud-profesionales.css'],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    DataTableComponent, 
    CardComponent, 
    DetailModal
  ],
  standalone: true,
})
export class CrudProfesionales implements OnInit {
  profesionales: Profesional[] = [];
  formProfesional!: FormGroup;
  editingId: number | null = null;

  // Modal de detalles
  profesionalView: Profesional | null = null;
  showViewModal = false;

  // Modal de crear/editar
  showEditModal = false;

  columns = [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'especialidad', header: 'Especialidad' },
    { field: 'email', header: 'Email' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'experiencia', header: 'Exp. (años)' },
    { field: 'disponibilidad', header: 'Disponible' }
  ];

  constructor(
    private servProfesionales: ServProfesionalesJson,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadProfesionales();
    this.initForm();
  }

  initForm() {
    this.formProfesional = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      especialidad: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      ubicacion: [''],
      oficios: [''],
      experiencia: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      disponibilidad: [true]
    });
  }

  loadProfesionales() {
    this.servProfesionales.getProfesionales().subscribe({
      next: (data) => this.profesionales = data,
      error: (error) => console.error('Error cargando profesionales:', error)
    });
  }

  // === MODAL DETALLES ===
  openView(profesional: Profesional) {
    this.profesionalView = profesional;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.profesionalView = null;
  }

  // === MODAL CREAR/EDITAR ===
  openNew() {
    this.editingId = null;
    this.formProfesional.reset({ 
      experiencia: 0, 
      disponibilidad: true 
    });
    this.showEditModal = true;
  }

  openEdit(profesional: Profesional) {
    this.editingId = profesional.id || null;
    this.formProfesional.patchValue({
      ...profesional,
      oficios: Array.isArray(profesional.oficios) 
        ? profesional.oficios.join(', ') 
        : profesional.oficios || ''
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.formProfesional.reset();
    this.editingId = null;
  }

  save() {
    if (this.formProfesional.invalid) {
      this.markFormGroupTouched(this.formProfesional);
      return;
    }

    const datos = {
      ...this.formProfesional.value,
      oficios: this.formProfesional.value.oficios
        ? this.formProfesional.value.oficios.split(',')
            .map((o: string) => o.trim())
            .filter(Boolean)
        : []
    };

    if (this.editingId) {
      this.servProfesionales.update({ ...datos, id: this.editingId } as Profesional).subscribe({
        next: () => {
          this.closeEditModal();
          this.loadProfesionales();
        },
        error: (error) => console.error('Error actualizando profesional:', error)
      });
    } else {
      this.servProfesionales.create(datos as Profesional).subscribe({
        next: () => {
          this.closeEditModal();
          this.loadProfesionales();
        },
        error: (error) => console.error('Error creando profesional:', error)
      });
    }
  }

  delete(profesional: Profesional) {
    if (confirm(`¿Eliminar a ${profesional.nombre}? Esta acción no se puede deshacer.`)) {
      this.servProfesionales.delete(profesional.id!).subscribe({
        next: () => this.loadProfesionales(),
        error: (error) => console.error('Error eliminando profesional:', error)
      });
    }
  }

  search(input: HTMLInputElement) {
    const q = input.value.trim();
    if (!q) {
      this.loadProfesionales();
    } else {
      this.servProfesionales.searchProfesionales(q).subscribe({
        next: (data) => this.profesionales = data,
        error: (error) => console.error('Error buscando profesionales:', error)
      });
    }
  }

  toggleDisponibilidad(profesional: Profesional) {
    const updated = {
      ...profesional,
      disponibilidad: !profesional.disponibilidad
    };
    
    this.servProfesionales.update(updated).subscribe({
      next: () => this.loadProfesionales(),
      error: (error) => console.error('Error cambiando disponibilidad:', error)
    });
  }

  getDisponibilidadText(disponible: boolean): string {
    return disponible ? 'Sí' : 'No';
  }

  getDisponibilidadClass(disponible: boolean): string {
    return disponible 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  // Helper para marcar todos los campos como touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters para validación del formulario
  get nombre() { return this.formProfesional.get('nombre'); }
  get especialidad() { return this.formProfesional.get('especialidad'); }
  get telefono() { return this.formProfesional.get('telefono'); }
  get email() { return this.formProfesional.get('email'); }
  get experiencia() { return this.formProfesional.get('experiencia'); }
}