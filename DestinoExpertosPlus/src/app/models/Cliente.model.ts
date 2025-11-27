import { Identifiable, WithContactInfo, WithLocation } from './base.model';

export interface Cliente extends Identifiable, WithContactInfo, WithLocation {
  preferencias: string[];
  notificaciones: boolean;
 
}

// Tipo para creación sin ID
export type ClienteCreate = Omit<Cliente, 'id'>;

// Tipo para actualización parcial
export type ClienteUpdate = Partial<Omit<Cliente, 'id'>>;