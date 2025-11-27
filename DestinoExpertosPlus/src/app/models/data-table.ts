import { Identifiable } from './base.model';

export type TipoColumna = 
  | 'texto' 
  | 'numero' 
  | 'fecha' 
  | 'boolean' 
  | 'acciones' 
  | 'estado';

export interface ColumnaTabla {
  field: string;
  header: string;
  tipo?: TipoColumna;
  ordenable?: boolean;
  filtrable?: boolean;
  ancho?: string;
  alineacion?: 'left' | 'center' | 'right';
}

export interface DataTableConfig<T extends Identifiable> {
  datos: T[];
  columnas: ColumnaTabla[];
  paginacion?: {
    paginaActual: number;
    itemsPorPagina: number;
    totalItems: number;
  };
  ordenamiento?: {
    campo: string;
    direccion: 'asc' | 'desc';
  };
}

// Implementación genérica
export interface DataTable<T extends Identifiable> {
  config: DataTableConfig<T>;
}