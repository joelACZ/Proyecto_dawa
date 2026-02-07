import { Identifiable, WithContactInfo, WithLocation } from './base.model';

export interface Profesional extends Identifiable, WithContactInfo, WithLocation {
  especialidad: string;
  oficios: string;
  experiencia: number; 
  disponibilidad: boolean;
  
}

export type ProfesionalCreate = Omit<Profesional, 'id'>;
export type ProfesionalUpdate = Partial<Omit<Profesional, 'id'>>;