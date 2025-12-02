import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 

// === IMPORTACIONES DE RXJS ===
import { Observable, forkJoin } from 'rxjs'; 

// Modelos (Asegúrate que estas rutas son correctas)
import { Solicitud } from '../../models/Solicitud.model';
import { Servicio } from '../../models/Servicio.model';
import { Cliente } from '../../models/Cliente.model'; 
import { Profesional } from '../../models/Profesional.model'; 

// Servicios
import { ServServiciosJson } from '../../services/servicio-service';
import { ServClientesJson } from '../../services/cliente-service'; 
import { SolicitudService } from '../../services/solicitud-service';
import { ProfesionalService } from '../../services/profesional-service';

// Componentes de diseño original
import { DataTableComponent } from '../shared/data-table/data-table';
import { CardComponent } from '../shared/cards/cards';

// Declaramos la librería Bootstrap (NECESARIO para el modal)
declare const bootstrap: any; 

@Component({
  selector: 'app-crud-solicitudes',
  templateUrl: './crud-solicitudes.html',
  styleUrls: ['./crud-solicitudes.css'],
  standalone: true,
  imports: [DataTableComponent, CardComponent, CommonModule, ReactiveFormsModule, DatePipe], 
})
export class CrudSolicitudes implements OnInit, AfterViewInit {

  // Listas de datos
  solicitudesOriginal: Solicitud[] = [];
  solicitudesTabla: any[] = [];         
  listaServicios: Servicio[] = []; 
  listaClientes: Cliente[] = []; 
  listaProfesionales: Profesional[] = []; 
  
  formSolicitud!: FormGroup; 
  editingId: number | null = null; 
  
  // PROPIEDADES DEL MODAL
  modalRef: any; 
  @ViewChild('solicitudModalRef') modalElement!: ElementRef;
  
  modalViewRef: any;
  @ViewChild('detailModalRef') detailModalElement!: ElementRef;
  solicitudView: any = null;

  listaEstados = ['pendiente', 'en_proceso', 'completado', 'cancelado'];

  columns = [
    { field: 'id', header: 'ID' },
    { field: 'fecha', header: 'Fecha' },
    { field: 'cliente_id', header: 'Cliente' }, 
    { field: 'profesional_id', header: 'Profesional' }, 
    { field: 'servicio_id', header: 'Servicio' },
    { field: 'ubicacion', header: 'Ubicación' },
    { field: 'estado', header: 'Estado' },
    { field: 'urgencia', header: 'Urgente' }
  ];

  constructor(
    private servSolicitudes: SolicitudService,
    private servServicios: ServServiciosJson,
    private servClientes: ServClientesJson, 
    private servProfesionales: ProfesionalService,
    private router: Router,
    private fb: FormBuilder 
  ) {
    this.initForm(); 
  }
  
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    this.modalViewRef = new bootstrap.Modal(this.detailModalElement.nativeElement);
  }

  initForm(): void {
    this.formSolicitud = this.fb.group({
      cliente_id: ['', Validators.required], 
      profesional_id: ['', Validators.required], 
      servicio_id: ['', Validators.required], 
      ubicacion: ['', [Validators.required, Validators.maxLength(100)]], 
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      estado: ['pendiente', Validators.required], 
      urgencia: [false], 
    });
  }

  ngOnInit() {
    this.loadData();
  }

  private formatFecha(date: any): string {
      const pipe = new DatePipe('es-EC'); 
      return pipe.transform(date, 'dd/MM/yyyy h:mm a') || 'N/A';
  }

  private formatUrgencia(isUrgent: boolean): string {
      return isUrgent ? 'SÍ' : 'NO';
  }

  loadData() {
    forkJoin({
      clientes: this.servClientes.getClientes() as Observable<Cliente[]>,
      profesionales: this.servProfesionales.getProfesionales() as Observable<Profesional[]>,
      servicios: this.servServicios.getServicios() as Observable<Servicio[]>
    }).subscribe(auxData => {
      this.listaClientes = auxData.clientes;
      this.listaProfesionales = auxData.profesionales;
      this.listaServicios = auxData.servicios;

      this.servSolicitudes.getSolicitudes().subscribe((solicitudes: Solicitud[]) => {
        this.solicitudesOriginal = solicitudes;
        
        this.solicitudesTabla = solicitudes.map(s => ({
          ...s,
          cliente_id: this.getClienteNombre(s.cliente_id), 
          profesional_id: this.getProfesionalNombre(s.profesional_id),
          servicio_id: this.getServicioNombre(s.servicio_id),
          fecha: s.fecha, // Dejamos fecha pura para el pipe
          urgencia: s.urgencia // Dejamos urgencia pura para la lógica booleana del HTML
        }));
      });
    });
  }
  
  openNew() {
      this.editingId = null;
      this.formSolicitud.reset({ estado: 'pendiente', urgencia: false });
      this.modalRef.show(); 
  }
  
  openEdit(solicitud: any) {
    // FIX TS2345: Usamos 'as any' para forzar el paso del ID (string|number)
    this.servSolicitudes.getSolicitudById(solicitud.id as any).subscribe((solicitudOriginal: Solicitud) => {
        this.editingId = solicitudOriginal.id ?? null;
        
        this.formSolicitud.patchValue({
            cliente_id: solicitudOriginal.cliente_id,
            profesional_id: solicitudOriginal.profesional_id,
            servicio_id: solicitudOriginal.servicio_id,
            ubicacion: solicitudOriginal.ubicacion,
            estado: solicitudOriginal.estado,
            urgencia: solicitudOriginal.urgencia,
            descripcion: solicitudOriginal.descripcion,
        });
        
        this.modalRef.show(); 
    });
  }
  
  save() {
    if (this.formSolicitud.invalid) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }

    const datos: Solicitud = this.formSolicitud.value;
    
    datos.cliente_id = Number(datos.cliente_id);
    datos.profesional_id = Number(datos.profesional_id);
    datos.servicio_id = Number(datos.servicio_id);


    if (this.editingId) { // Editar
      
      // FIX TS2345: Usamos 'as any' para forzar el paso del ID (string|number)
      this.servSolicitudes.getSolicitudById(this.editingId as any).subscribe(() => {
          
          let solicitudUpdate: Solicitud = { 
              ...datos, 
              id: this.editingId!, 
              fecha: new Date() 
          }; 

          this.servSolicitudes.update(solicitudUpdate).subscribe(() => {
            alert("Solicitud Actualizada");
            this.modalRef.hide(); 
            this.cancelEdit();
            this.loadData();
          });
      });
      
    } else { // Crear nueva
      let solicitudNew: Solicitud = { 
        ...datos,
        fecha: new Date(), 
        estado: 'pendiente' 
      }; 

      this.servSolicitudes.create(solicitudNew).subscribe(() => {
        alert("Solicitud creada");
        this.modalRef.hide(); 
        this.cancelEdit();
        this.loadData();
      });
    }
  }

  delete(solicitud: Solicitud) {
    // FIX TS2345: Usamos 'as any' en la llamada si es necesario
    if (!confirm(`¿Estás seguro de cancelar la solicitud #${solicitud.id}?`)) return;
    
    this.servSolicitudes.delete(solicitud.id as any).subscribe(() => {
      alert("Solicitud Cancelada exitosamente");
      this.loadData();
    });
  }
  
  cancelEdit() {
      if (this.modalRef) {
          this.modalRef.hide();
      }
      this.editingId = null;
      this.formSolicitud.reset({ estado: 'pendiente', urgencia: false });
  }

  // viewDetails(id) para el modal de binoculares
  viewDetails(id: number | string) {
    // FIX TS2345: Usamos 'as any' para forzar el paso del ID (string|number)
    this.servSolicitudes.getSolicitudById(id as any).subscribe((solicitudOriginal: Solicitud) => {
        
        // Creamos el objeto de vista con los nombres resueltos
        this.solicitudView = {
            id: solicitudOriginal.id,
            fecha: solicitudOriginal.fecha, 
            cliente: this.getClienteNombre(solicitudOriginal.cliente_id), 
            profesional: this.getProfesionalNombre(solicitudOriginal.profesional_id),
            servicio: this.getServicioNombre(solicitudOriginal.servicio_id),
            ubicacion: solicitudOriginal.ubicacion,
            descripcion: solicitudOriginal.descripcion,
            estado: solicitudOriginal.estado,
            urgencia: solicitudOriginal.urgencia ? 'SÍ' : 'NO',
            
            cliente_id: solicitudOriginal.cliente_id,
            profesional_id: solicitudOriginal.profesional_id,
            servicio_id: solicitudOriginal.servicio_id,
        };
        
        this.modalViewRef.show();
    });
  }

  view(id: number | undefined) {
    if (id) {
        this.viewDetails(id);
    }
  }

  // --- MÉTODOS HELPERS ---
  search(input: HTMLInputElement) {
    const param = input.value;
    this.servSolicitudes.searchSolicitudes(param).subscribe((data: Solicitud[]) => {
        this.solicitudesOriginal = data;
        this.solicitudesTabla = data.map(s => ({
            ...s,
            cliente_id: this.getClienteNombre(s.cliente_id), 
            profesional_id: this.getProfesionalNombre(s.profesional_id),
            servicio_id: this.getServicioNombre(s.servicio_id),
            fecha: s.fecha, 
            urgencia: s.urgencia
        }));
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