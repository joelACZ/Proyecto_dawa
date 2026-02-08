export interface Identifiable {
  id: number;
}

export interface WithTimestamps {
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface WithContactInfo {
  nombre: string;
  email: string;
  telefono: number;
}

export interface WithLocation {
  direccion?: string;
}

export interface WithStatus {
  activo: boolean;
  estado?: string;
}

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