import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

// === IMPORTACIONES DE RXJS ===
import { Observable, forkJoin } from 'rxjs'; 
import { map } from 'rxjs/operators'; 

// Modelos
import { Solicitud } from '../../models/Solicitud.model';
import { Servicio } from '../../models/Servicio.model';
import { Cliente } from '../../models/Cliente.model'; 
import { Profesional } from '../../models/Profesional.model';

// Servicios
import { ServServiciosJson } from '../../services/servicio-service';
import { ServClientesJson } from '../../services/cliente-service'; 
import { SolicitudService } from '../../services/solicitud-service';
import { ProfesionalService } from '../../services/profesional-service';

// Componentes Reutilizables
import { DataTableComponent } from "../data-table/data-table";
import { CardComponent } from "../cards/cards";

@Component({
  selector: 'app-crud-solicitudes',
  templateUrl: './crud-solicitudes.html',
  styleUrls: ['./crud-solicitudes.css'],
  standalone: true,
  imports: [DataTableComponent, CardComponent, CommonModule, FormsModule], 
})
export class CrudSolicitudes implements OnInit {

  // La interfaz de Solicitud ahora debe ser más flexible para aceptar strings (nombres)
  solicitudes: any[] = []; // Usamos 'any' porque transformaremos IDs (number) a Nombres (string)
  solicitudEdit: Solicitud | null = null;

  listaServicios: Servicio[] = [];
  listaClientes: any[] = [];      
  listaProfesionales: any[] = []; 

  // Columnas para el data-table
  // NOTA: Los fields 'cliente_id', etc., ahora mostrarán el string (nombre)
  columns = [
    { field: 'id', header: 'ID' },
    { field: 'fecha', header: 'Fecha' },
    { field: 'cliente_id', header: 'Cliente' }, 
    { field: 'profesional_id', header: 'Profesional' }, 
    { field: 'servicio_id', header: 'Servicio' },
    { field: 'ubicacion', header: 'Ubicación' },
    { field: 'estado', header: 'Estado' },
    { field: 'urgencia', header: 'Urgente' },
    { field: 'actions', header: 'Acciones' } // Añadimos la columna de acciones aquí
  ];

  constructor(
    private servSolicitudes: SolicitudService,
    private servServicios: ServServiciosJson,
    private servClientes: ServClientesJson, 
    private servProfesionales: ProfesionalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData(); // Llama al nuevo método que carga todo
  }

  loadData() {
    // 1. Usamos forkJoin para esperar a que todas las listas auxiliares carguen
    forkJoin({
        clientes: this.servClientes.getClientes(),
        profesionales: this.servProfesionales.getProfesionales(),
        servicios: this.servServicios.getServicios()
    }).subscribe(auxData => {
        // Almacenamos las listas para usarlas en el formulario y los helpers
        this.listaClientes = auxData.clientes;
        this.listaProfesionales = auxData.profesionales;
        this.listaServicios = auxData.servicios;

        // 2. Cargamos las solicitudes y las transformamos
        this.servSolicitudes.getSolicitudes().subscribe((solicitudes: Solicitud[]) => {
            this.solicitudes = solicitudes.map(s => ({
                ...s,
                // Transformamos el ID a Nombre usando los helpers y las listas cargadas
                cliente_id: this.getClienteNombre(s.cliente_id), 
                profesional_id: this.getProfesionalNombre(s.profesional_id),
                servicio_id: this.getServicioNombre(s.servicio_id)
            }));
        });
    });
  }

  view(id: number | undefined) {
    if (id) {
      this.router.navigate(['/solicitud-view/', id]);
    }
  }

  search(input: HTMLInputElement) {
    const param = input.value;
    this.servSolicitudes.searchSolicitudes(param).subscribe((data: Solicitud[]) => {
       this.solicitudes = data.map(s => ({
            ...s,
            cliente_id: this.getClienteNombre(s.cliente_id), 
            profesional_id: this.getProfesionalNombre(s.profesional_id),
            servicio_id: this.getServicioNombre(s.servicio_id)
        }));
    });
  }

  create(form: any) {
    const nuevo: Solicitud = form.value;

    nuevo.cliente_id = Number(nuevo.cliente_id);
    nuevo.profesional_id = Number(nuevo.profesional_id);
    nuevo.servicio_id = Number(nuevo.servicio_id);
    nuevo.fecha = new Date(); // Fecha automática al crear
    nuevo.estado = 'pendiente'; // Estado inicial

    this.servSolicitudes.create(nuevo).subscribe(() => {
      form.reset();
      this.loadData(); // Llama al método completo para recargar la tabla
    });
  }

  edit(solicitud: Solicitud) {
    const solicitudOriginal = this.solicitudes.find(s => s.id === solicitud.id);
    
    this.solicitudEdit = { ...solicitudOriginal }; 
  }

  update(form: any) {
    if (!this.solicitudEdit) return;

    const actualizado: Solicitud = { ...this.solicitudEdit, ...form.value };
    
    actualizado.cliente_id = Number(actualizado.cliente_id);
    actualizado.profesional_id = Number(actualizado.profesional_id);
    actualizado.servicio_id = Number(actualizado.servicio_id);

    this.servSolicitudes.update(actualizado).subscribe(() => {
      this.solicitudEdit = null;
      form.reset();
      this.loadData(); // Llama al método completo para recargar la tabla
    });
  }

  delete(solicitud: Solicitud) {
    if (!confirm(`¿Estás seguro de cancelar la solicitud #${solicitud.id}?`)) return;
    
    this.servSolicitudes.delete(solicitud.id).subscribe(() => {
      this.loadData(); // Llama al método completo para recargar la tabla
    });
  }

  getClienteNombre(id: number | string): string {
      const cliente = this.listaClientes.find(c => +c.id === +id); 
      return cliente ? cliente.nombre : 'N/A';
  }

  getProfesionalNombre(id: number | string): string {
      const profesional = this.listaProfesionales.find(p => +p.id === +id);
      return profesional ? `${profesional.nombre} (${profesional.especialidad})` : 'N/A';
  }

  getServicioNombre(id: number | string): string {
      const servicio = this.listaServicios.find(s => +s.id === +id);
      return servicio ? servicio.nombre : 'N/A';
  }
}