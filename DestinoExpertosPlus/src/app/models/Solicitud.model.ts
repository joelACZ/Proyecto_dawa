export interface Solicitud {
  id: number;
  cliente_id: number;
  profesional_id: number;
  servicio_id: number;
  fecha: Date;
  estado: string;
  descripcion: string;
  ubicacion: string;
  urgencia: boolean;
}
