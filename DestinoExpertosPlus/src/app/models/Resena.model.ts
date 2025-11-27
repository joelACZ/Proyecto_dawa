import { Identifiable, WithTimestamps } from './base.model';

export interface Resena extends Identifiable, WithTimestamps {
  solicitud_id: number;
  calificacion: number; // 1-5
  comentario: string;
  fecha: Date;
  anonima: boolean;
  
  // Validaciones incorporadas en la interfaz
  restricciones?: {
    calificacionMinima: 1;
    calificacionMaxima: 5;
    longitudMaximaComentario: 500;
  }
}

export type ResenaCreate = Omit<Resena, 'id' | 'fecha'>;
export type ResenaUpdate = Partial<Omit<Resena, 'id' | 'solicitud_id'>>;

// Tipo para calificaciones válidas
export type CalificacionValida = 1 | 2 | 3 | 4 | 5;