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
<<<<<<< HEAD
=======

  // PARA EL MODAL REUTILIZABLE (DetailModal)
>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
  resenaDetalle: Resena | null = null;
  showDetailModal: boolean = false;

  // Otros modales
  showDeleteModal = false;
  showNotificationModal = false;
  showErrorModal = false;
  resenaAEliminar: Resena | null = null;
<<<<<<< HEAD
 
  notificationMessage: string = '';
  errorMessage: string = '';
 
=======
  notificationMessage = '';
  errorMessage = '';

>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
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

<<<<<<< HEAD
  openEdit(resena: any) {
    this.resenaEdit = {
      id: resena.id,
      solicitud_id: resena.solicitud_id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: resena.fecha,
      anonima: resena.anonima
    };
    
    const fechaFormateada = typeof resena.fecha === 'string'
      ? resena.fecha
      : new Date(resena.fecha).toISOString().split('T')[0];

=======
  openEdit(resena: Resena) {
    this.resenaEdit = { ...resena };
    const fecha = typeof resena.fecha === 'string' ? resena.fecha : new Date(resena.fecha).toISOString().split('T')[0];
>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
    this.formResena.patchValue({
      solicitud_id: resena.solicitud_id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: fecha,
      anonima: resena.anonima
    });
<<<<<<< HEAD
   
=======
>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
    this.modalRef.show();
  }

  save() {
    if (this.formResena.invalid) {
      this.formResena.markAllAsTouched();
      return;
    }

    const datos = this.formResena.value;

<<<<<<< HEAD
    if (this.resenaEdit && this.resenaEdit.id) {
      // ACTUALIZAR - Mantener ID como string
      const resenaData: any = {
        id: String(this.resenaEdit.id),
        solicitud_id: +datos.solicitud_id,
        calificacion: +datos.calificacion,
        comentario: datos.comentario,
        fecha: datos.fecha,
        anonima: Boolean(datos.anonima)
      };

      this.servResenas.update(resenaData).subscribe({
        next: () => {
          this.loadResenas();
          this.modalRef.hide();
          this.showNotification('Reseña actualizada correctamente');
        },
        error: (error) => {
          console.error('Error actualizando reseña:', error);
          this.showError('Error al actualizar la reseña.');
        }
      });
    } else {
      // CREAR - Obtener el ID máximo como string
      this.servResenas.getResenas().subscribe({
        next: (resenas) => {
          const maxId = resenas.length > 0 
            ? Math.max(...resenas.map(r => parseInt(String(r.id)) || 0)) 
            : 0;
          
          const resenaData: any = {
            id: String(maxId + 1),
            solicitud_id: +datos.solicitud_id,
            calificacion: +datos.calificacion,
            comentario: datos.comentario,
            fecha: datos.fecha,
            anonima: Boolean(datos.anonima)
          };

          this.servResenas.create(resenaData).subscribe({
            next: () => {
              this.loadResenas();
              this.modalRef.hide();
              this.showNotification('Reseña creada correctamente');
            },
            error: (error) => {
              console.error('Error creando reseña:', error);
              this.showError('Error al crear la reseña.');
            }
          });
        },
        error: (error) => {
          console.error('Error obteniendo reseñas para ID:', error);
=======
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
>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
        }
      });
    }
  }

<<<<<<< HEAD
  view(resena: any) {
    this.resenaDetalle = {
      id: resena.id,
      solicitud_id: resena.solicitud_id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: resena.fecha,
      anonima: resena.anonima
    };
    this.showDetailModal = true;
  }

  openDeleteModal(resena: any) {
    this.resenaAEliminar = {
      id: resena.id,
      solicitud_id: resena.solicitud_id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: resena.fecha,
      anonima: resena.anonima
    };
=======
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
>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
    this.showDeleteModal = true;
  }

  confirmDelete() {
<<<<<<< HEAD
    if (!this.resenaAEliminar) return;

    const id = this.resenaAEliminar.id;
    if (!id) return;

    this.servResenas.delete(id as any).subscribe({
=======
    if (!this.resenaAEliminar?.id) return;
    this.servResenas.delete(this.resenaAEliminar.id).subscribe({
>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
      next: () => {
        this.showNotification('Reseña eliminada');
        this.loadResenas();
        this.closeDeleteModal();
<<<<<<< HEAD
      },
      error: (error) => {
        console.error('Error eliminando reseña:', error);
        this.showError('Error al eliminar la reseña.');
        this.closeDeleteModal();
=======
>>>>>>> ff79e5bc15c183482c72ad21682a8316d88e4ed2
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