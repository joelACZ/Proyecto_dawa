import { Component, ElementRef, ViewChild } from '@angular/core';
import { Resena } from '../../models/Resena.model';
import { ServResenasJson } from '../../services/resena-service';
import { Router } from '@angular/router';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';
import { DetailModal } from "../shared/detail-modal/detail-modal";

declare const bootstrap: any;

@Component({
  selector: 'app-resena-crud',
  standalone: true,
  templateUrl: './crud-resenas.html',
  styleUrls: ['./crud-resenas.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, CommonModule, DetailModal],
})
export class CrudResenas {
  resenas: Resena[] = [];
  resenasParaTabla: any[] = [];
  resenaEdit: Resena | null = null;
  modalRef: any;

  // PARA EL MODAL REUTILIZABLE (DetailModal)
  resenaDetalle: Resena | null = null;
  showDetailModal: boolean = false;

  // Otros modales
  showDeleteModal = false;
  showNotificationModal = false;
  showErrorModal = false;
  resenaAEliminar: Resena | null = null;
  notificationMessage = '';
  errorMessage = '';

  formResena!: FormGroup;

  opcionesCalificacion = [
    { valor: 1, texto: '1★ - Pésimo servicio' },
    { valor: 2, texto: '2★ - Mal servicio' },
    { valor: 3, texto: '3★ - Servicio regular' },
    { valor: 4, texto: '4★ - Buen servicio' },
    { valor: 5, texto: '5★ - Excelente servicio' },
  ];

  @ViewChild('resenaModal') modalElement!: ElementRef;

  constructor(
    private servResenas: ServResenasJson,
    private fb: FormBuilder
  ) {
    this.loadResenas();
    this.inicializarFormulario();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  inicializarFormulario() {
    this.formResena = this.fb.group({
      solicitud_id: ['', [Validators.required, Validators.min(1)]],
      calificacion: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      fecha: ['', Validators.required],
      anonima: [false],
    });
  }

  loadResenas() {
    this.servResenas.getResenas().subscribe({
      next: (data) => {
        this.resenas = data;
        this.formatearDatosParaTabla();
      },
      error: () => this.showError('Error al cargar reseñas')
    });
  }

  formatearDatosParaTabla() {
    this.resenasParaTabla = this.resenas.map(r => ({
      ...r,
      calificacionFormateada: `${r.calificacion} ★ - ${this.obtenerTextoCalificacion(r.calificacion)}`,
      anonimaFormateada: r.anonima ? 'Sí' : 'No'
    }));
  }

  search(input: HTMLInputElement) {
    const param = input.value.trim();
    if (!param) {
      this.loadResenas();
      return;
    }
    this.servResenas.searchResenas(param).subscribe({
      next: (data) => {
        this.resenas = data;
        this.formatearDatosParaTabla();
      }
    });
  }

  openNew() {
    this.resenaEdit = null;
    this.formResena.reset({ anonima: false });
    this.modalRef.show();
  }

  openEdit(resena: Resena) {
    this.resenaEdit = { ...resena };
    const fecha = typeof resena.fecha === 'string' ? resena.fecha : new Date(resena.fecha).toISOString().split('T')[0];
    this.formResena.patchValue({
      solicitud_id: resena.solicitud_id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: fecha,
      anonima: resena.anonima
    });
    this.modalRef.show();
  }

  save() {
    if (this.formResena.invalid) {
      this.formResena.markAllAsTouched();
      return;
    }

    const datos = this.formResena.value;

    if (this.resenaEdit?.id) {
      const updated: Resena = { ...this.resenaEdit, ...datos, calificacion: Number(datos.calificacion) };
      this.servResenas.update(updated).subscribe({
        next: () => {
          this.loadResenas();
          this.modalRef.hide();
          this.showNotification('Reseña actualizada');
        }
      });
    } else {
      this.servResenas.create({ ...datos, calificacion: Number(datos.calificacion) } as Resena).subscribe({
        next: () => {
          this.loadResenas();
          this.modalRef.hide();
          this.showNotification('Reseña creada');
        }
      });
    }
  }

  // ← AQUÍ USAMOS TU MODAL REUTILIZABLE
  view(resena: Resena) {
    this.resenaDetalle = resena;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.resenaDetalle = null;
  }

  openDeleteModal(resena: Resena) {
    this.resenaAEliminar = resena;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.resenaAEliminar?.id) return;
    this.servResenas.delete(this.resenaAEliminar.id).subscribe({
      next: () => {
        this.showNotification('Reseña eliminada');
        this.loadResenas();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.resenaAEliminar = null;
  }

  showNotification(msg: string) {
    this.notificationMessage = msg;
    this.showNotificationModal = true;
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.showErrorModal = true;
  }

  obtenerTextoCalificacion(c: number): string {
    const t = ['', 'Pésimo servicio', 'Mal servicio', 'Servicio regular', 'Buen servicio', 'Excelente servicio'];
    return t[c] || '';
  }
}