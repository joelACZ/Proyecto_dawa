// Interfaces base para composición
export interface Identifiable {
  id: number;
}

export interface WithTimestamps {
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface WithContactInfo {
  nombre: string;
  email: string;
  telefono: string;
}

export interface WithLocation {
  ubicacion: string;
  direccion?: string;
}

export interface WithStatus {
  activo: boolean;
  estado?: string;
}