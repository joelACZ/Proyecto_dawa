import { Servicio } from "./Servicio.model";

export interface Categoria {
  nombre: string;  // ¡Este es el PRIMARY KEY, NO HAY ID!
  servicios?: Servicio[]; // Opcional
}