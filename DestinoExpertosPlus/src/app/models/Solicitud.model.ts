import { Identifiable, WithTimestamps } from './base.model';

export type EstadoSolicitud = 
  | 'pendiente' 
  | 'confirmada' 
  | 'en_proceso' 
  | 'completada' 
  | 'cancelada';

export type NivelUrgencia = 'baja' | 'media' | 'alta';

export interface Solicitud extends Identifiable, WithTimestamps {
  cliente_id: number;
  profesional_id: number;
  servicio_id: number;
  fecha: Date;
  estado: EstadoSolicitud;
  descripcion: string;
  ubicacion: string;
  urgencia: boolean;
  nivelUrgencia?: NivelUrgencia; 

}

export type SolicitudCreate = Omit<Solicitud, 'id' | 'fecha'>;
export type SolicitudUpdate = Partial<Omit<Solicitud, 'id' | 'cliente_id'>>;