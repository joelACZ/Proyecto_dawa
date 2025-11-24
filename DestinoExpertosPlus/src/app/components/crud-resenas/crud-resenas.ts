import { Component } from '@angular/core';
import { Resena } from '../../models/Resena.model';
import { ServResenasJson } from '../../services/resena-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resena-crud',
  templateUrl: './crud-resenas.html',
  styleUrls: ['./crud-resenas.css'],
})
export class CrudResenas {

  resenas: Resena[] = [];
  resenaEdit: Resena | null = null;

  constructor(private servResenas: ServResenasJson , private router:Router) {
    this.loadResenas();
  }

  // Cargar lista
  loadResenas() {
    this.servResenas.getResenas().subscribe((data) => {
      this.resenas = data;
    });
  }

  // Buscar reseña
  search(input: HTMLInputElement) {
    const param = input.value;
    this.servResenas.searchResenas(param).subscribe((data) => {
      this.resenas = data;
    });
  }

  // Crear nueva reseña
  create(form: any) {
    const nueva: Resena = form.value;

    // Conversión automática de fecha
    if (nueva.fecha) {
      nueva.fecha = new Date(nueva.fecha);
    }

    this.servResenas.create(nueva).subscribe(() => {
      form.reset();
      this.loadResenas();
    });
  }

  // Seleccionar reseña para editar
  edit(resena: Resena) {
    this.resenaEdit = { ...resena };
  }

  // Guardar ediciones
  update(form: any) {
    if (!this.resenaEdit) return;

    const actualizada: Resena = {
      ...this.resenaEdit,
      ...form.value,
      fecha: new Date(form.value.fecha)
    };

    this.servResenas.update(actualizada).subscribe(() => {
      this.resenaEdit = null;
      form.reset();
      this.loadResenas();
    });
  }
  // Visualiar detalles

      view(id:number | undefined){
      //navegar a otro componente //viene de app-routing.module.ts
      //this.router.navigate(["movie-view"]); parametros
      this.router.navigate(["/movie-view/", id]);
      let pre=22323;
      //this.router.navigate(["/movie-view/", id,1]);
    }

  // Eliminar
  delete(resena: Resena) {
    if (!confirm(`¿Eliminar reseña #${resena.id}?`)) return;

    const id = resena.id;
    if (id == null) return;

    this.servResenas.delete(id).subscribe(() => {
      this.loadResenas();
    });
  }
}
