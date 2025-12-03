import { Component, ElementRef, ViewChild } from '@angular/core';
import { Resena } from '../../models/Resena.model';
import { ServResenasJson } from '../../services/resena-service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';

declare const bootstrap: any;

@Component({
  selector: 'app-resena-crud',
  standalone: true,
  templateUrl: './crud-resenas.html',
  styleUrls: ['./crud-resenas.css'],
  imports: [DataTableComponent, CardComponent, ReactiveFormsModule, CommonModule],
})
export class CrudResenas {
  resenas: Resena[] = [];
  resenasParaTabla: any[] = [];
  resenaEdit: Resena | null = null;
  modalRef: any;
  resenaDetalle: Resena | null = null;
  showDetailModal: boolean = false;
  showDeleteModal: boolean = false;
  showNotificationModal: boolean = false;
  showErrorModal: boolean = false;
  resenaAEliminar: Resena | null = null;
 
  notificationMessage: string = '';
  errorMessage: string = '';
 
  formResena!: FormGroup;
  opcionesCalificacion = [
    { valor: 1, texto: '1★ - Pésimo servicio' },
    { valor: 2, texto: '2★ - Mal servicio' },
    { valor: 3, texto: '3★ - Servicio regular' },
    { valor: 4, texto: '4★ - Buen servicio' },
    { valor: 5, texto: '5★ - Excelente servicio' },
  ];

  constructor(
    private servResenas: ServResenasJson,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loadResenas();
    this.inicializarFormulario();
  }

  @ViewChild('resenaModal') modalElement!: ElementRef;

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
      error: (error) => {
        console.error('Error cargando reseñas:', error);
        this.showError('Error al cargar las reseñas. Verifica que JSON Server esté corriendo.');
      }
    });
  }

  formatearDatosParaTabla() {
    this.resenasParaTabla = this.resenas.map(resena => ({
      ...resena,
      calificacionFormateada: `${resena.calificacion} ★ - ${this.obtenerTextoCalificacion(resena.calificacion)}`,
      anonimaFormateada: resena.anonima ? 'Sí' : 'No'
    }));
  }

  search(input: HTMLInputElement) {
    const param = input.value;
    if (param.trim() === '') {
      this.loadResenas();
      return;
    }
    this.servResenas.searchResenas(param).subscribe({
      next: (data) => {
        this.resenas = data;
        this.formatearDatosParaTabla();
      },
      error: (error) => {
        console.error('Error buscando reseñas:', error);
      }
    });
  }

  openNew() {
    this.resenaEdit = null;
    this.formResena.reset({ anonima: false });
    this.modalRef.show();
  }

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

    this.formResena.patchValue({
      solicitud_id: resena.solicitud_id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      fecha: fechaFormateada,
      anonima: resena.anonima
    });
   
    this.modalRef.show();
  }

  save() {
    if (this.formResena.invalid) {
      Object.keys(this.formResena.controls).forEach(key => {
        this.formResena.get(key)?.markAsTouched();
      });
      return;
    }

    const datos = this.formResena.value;

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
        }
      });
    }
  }

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
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.resenaAEliminar) return;

    const id = this.resenaAEliminar.id;
    if (!id) return;

    this.servResenas.delete(id as any).subscribe({
      next: () => {
        this.showNotification('Reseña eliminada correctamente');
        this.loadResenas();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error eliminando reseña:', error);
        this.showError('Error al eliminar la reseña.');
        this.closeDeleteModal();
      }
    });
  }

  showNotification(message: string) {
    this.notificationMessage = message;
    this.showNotificationModal = true;
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.resenaAEliminar = null;
  }

  closeNotificationModal() {
    this.showNotificationModal = false;
    this.notificationMessage = '';
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  closeDetail() {
    this.showDetailModal = false;
    this.resenaDetalle = null;
  }

  obtenerTextoCalificacion(calificacion: number = 0): string {
    const textos = [
      '',
      'Pésimo servicio',
      'Mal servicio',
      'Servicio regular',
      'Buen servicio',
      'Excelente servicio',
    ];
    return textos[calificacion] || '';
  }
}