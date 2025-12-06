import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profesional } from '../../models/Profesional.model';
import { ServProfesionalesJson } from '../../services/profesionales-service';
import { DataTableComponent } from '../shared/data-table/data-table';
import { Cards } from '../shared/cards/cards';
import { DetailModal } from '../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-crud-profesionales',
  templateUrl: './crud-profesionales.html',
  styleUrls: ['./crud-profesionales.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    Cards,
    DetailModal
  ],
  standalone: true,
})
export class CrudProfesionales implements OnInit {

  profesionales: Profesional[] = [];
  formProfesional!: FormGroup;

  profesionalView: Profesional | null = null;
  showViewModal = false;

  showEditModal = false;
  editingId: number | null = null;

  columns = [
  { field: 'id', header: 'ID' },
  { field: 'nombre', header: 'Nombre' },
  { field: 'especialidad', header: 'Especialidad' },
  { field: 'email', header: 'Email' },
  { field: 'telefono', header: 'Teléfono' },
  { field: 'ubicacion', header: 'Ubicación' },
  { field: 'oficios', header: 'Oficios' },
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
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]],
    ubicacion: [''],
    oficios: [''],
    experiencia: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
    disponibilidad: [true]
  });
}

  loadProfesionales() {
    this.servProfesionales.getProfesionales().subscribe(data => {
      this.profesionales = data;
    });
  }

  // === VIEW ===
  openView(p: Profesional) {
    this.profesionalView = p;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.profesionalView = null;
  }

  // === CREATE / EDIT ===
  openNew() {
    this.editingId = null;
    this.formProfesional.reset({
      experiencia: 0,
      disponibilidad: true
    });
    this.showEditModal = true;
  }

  openEdit(p: Profesional) {
    this.editingId = p.id || null;

    this.formProfesional.patchValue({
      ...p,
      oficios: Array.isArray(p.oficios)
        ? p.oficios.join(', ')
        : p.oficios || ''
    });

    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingId = null;
    this.formProfesional.reset();
  }

  save() {
    if (this.formProfesional.invalid) {
      this.markFormTouched();
      return;
    }

    const datos = {
      ...this.formProfesional.value,
      oficios: this.formProfesional.value.oficios
        ? this.formProfesional.value.oficios
            .split(',')
            .map((o: string) => o.trim())
            .filter(Boolean)
        : []
    };

    if (this.editingId) {
      this.servProfesionales.update({ ...datos, id: this.editingId }).subscribe(() => {
        this.closeEditModal();
        this.loadProfesionales();
      });
    } else {
      this.servProfesionales.create(datos).subscribe(() => {
        this.closeEditModal();
        this.loadProfesionales();
      });
    }
  }

  delete(p: Profesional) {
    if (!confirm(`¿Eliminar a ${p.nombre}?`)) return;

    this.servProfesionales.delete(p.id!).subscribe(() => {
      this.loadProfesionales();
    });
  }

  search(input: HTMLInputElement) {
    const q = input.value.trim();

    if (!q) {
      this.loadProfesionales();
      return;
    }

    this.servProfesionales.searchProfesionales(q).subscribe(data => {
      this.profesionales = data;
    });
  }

  toggleDisponibilidad(p: Profesional) {
    const actualizado = {
      ...p,
      disponibilidad: !p.disponibilidad
    };

    this.servProfesionales.update(actualizado).subscribe(() => {
      this.loadProfesionales();
    });
  }

  getDisponibilidadText(d: boolean): string {
    return d ? 'Sí' : 'No';
  }

  getDisponibilidadClass(d: boolean): string {
    return d
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  private markFormTouched() {
    Object.values(this.formProfesional.controls).forEach(c => c.markAsTouched());
  }

}
