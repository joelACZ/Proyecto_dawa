import { Identifiable, WithTimestamps } from './base.model';

export interface Resena extends Identifiable, WithTimestamps {
  solicitud_id: number;
  calificacion: number;
  comentario: string;
  fecha: Date;
  anonima: boolean;
  

  restricciones?: {
    calificacionMinima: 1;
    calificacionMaxima: 5;
    longitudMaximaComentario: 500;
  }
}

export type ResenaCreate = Omit<Resena, 'id' | 'fecha'>;
export type ResenaUpdate = Partial<Omit<Resena, 'id' | 'solicitud_id'>>;


export type CalificacionValida = 1 | 2 | 3 | 4 | 5;