import { Identifiable, WithStatus } from './base.model';

export interface Servicio extends Identifiable, WithStatus {
  nombre: string;
  categoria: string;
  descripcion: string;
  precioBase: number;
  duracionEstimada: number; // en minutos
  profesional_id: number;

}

export type ServicioCreate = Omit<Servicio, 'id'>;
export type ServicioUpdate = Partial<Omit<Servicio, 'id'>>;

// Tipos específicos para categorías
export type CategoriaServicio = 
  | 'hogar' 
  | 'salud' 
  | 'belleza' 
  | 'tecnologia' 
  | 'educacion' 
  | 'otros';