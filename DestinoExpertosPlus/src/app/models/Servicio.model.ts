export interface Servicio {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioBase: number;
  duracionEstimada: number;
  profesional_id: number;
  activo: boolean;
}
