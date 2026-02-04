import { Identifiable, WithStatus } from './base.model';

export interface Servicio extends Identifiable, WithStatus {
  nombre: string;
  categoria: string;
  descripcion: string;
  precioBase: number;
  duracionEstimada: number;
  profesional_id?: number;
   // profesional_id?: Profesional_id ;//

}

export type ServicioCreate = Omit<Servicio, 'id'>;
export type ServicioUpdate = Partial<Omit<Servicio, 'id'>>;

