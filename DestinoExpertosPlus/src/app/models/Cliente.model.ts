import { Identifiable, WithContactInfo, WithLocation } from './base.model';

export interface Cliente extends Identifiable, WithContactInfo, WithLocation {
  preferencias: string[];
  notificaciones: boolean;
 
}

export type ClienteCreate = Omit<Cliente, 'id'>;

export type ClienteUpdate = Partial<Omit<Cliente, 'id'>>;