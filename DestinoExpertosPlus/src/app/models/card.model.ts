export type TipoCard = 
  | 'default' 
  | 'servicio' 
  | 'profesional' 
  | 'cliente' 
  | 'solicitud' 
  | 'resena';

export interface CardBase {
  title: string;
  subtitle?: string;
  content?: string;
  tipo?: TipoCard;
  accion?: {
    texto: string;
    ruta?: string;
    funcion?: () => void;
  };
  badges?: string[];
  imagen?: string;
}

// Cards específicas por tipo
export interface CardServicio extends CardBase {
  tipo: 'servicio';
  precio?: number;
  duracion?: number;
  profesional?: string;
}

export interface CardProfesional extends CardBase {
  tipo: 'profesional';
  especialidad?: string;
  experiencia?: number;
  disponibilidad?: boolean;
}

export type Card = CardBase | CardServicio | CardProfesional;