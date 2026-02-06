import { Identifiable, WithTimestamps } from './base.model';


export enum EstadoSolicitud {
  Pendiente = 'pendiente',
  Confirmada = 'confirmada',
  EnProceso = 'en_proceso',
  Completada = 'completada',
  Cancelada = 'cancelada',
}

export enum NivelUrgencia {
  Baja = 'baja',
  Media = 'media',
  Alta = 'alta',
}


export interface Solicitud extends Identifiable, WithTimestamps {
  cliente_id: number;
  servicio_id: number;
  fecha: Date;


  estado: EstadoSolicitud;
  nivelUrgencia: NivelUrgencia;

  descripcion: string;
  ubicacion: string;
}


export type SolicitudCreate = Omit<Solicitud, 'id' | 'fecha'>;
export type SolicitudUpdate = Partial<Omit<Solicitud, 'id' | 'cliente_id'>>;
