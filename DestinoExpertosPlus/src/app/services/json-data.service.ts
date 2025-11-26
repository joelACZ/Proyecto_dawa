import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Solicitud } from '../models/Solicitud.model';
import { Servicio } from '../models/Servicio.model';
import { Cliente } from '../models/Cliente.model';
import { Profesional } from '../models/Profesional.model';
import { Resena } from '../models/Resena.model';

interface JsonData {
  solicitudes: Solicitud[];
  servicios: Servicio[];
  clientes: Cliente[];
  profesionales: Profesional[];
  resenas: Resena[];
}

@Injectable({
  providedIn: 'root'
})
export class JsonDataService {
  private readonly STORAGE_KEY = 'destinoExpertosData';
  private dataSubject = new BehaviorSubject<JsonData>(this.getInitialData());

  constructor() {
    this.loadDataFromStorage();
  }

  // Obtener datos iniciales
  private getInitialData(): JsonData {
    return {
      solicitudes: [],
      servicios: [],
      clientes: [],
      profesionales: [],
      resenas: []
    };
  }

  // Cargar datos desde localStorage o usar datos por defecto
  private loadDataFromStorage(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        this.dataSubject.next(parsedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        this.loadDefaultData();
      }
    } else {
      this.loadDefaultData();
    }
  }

  // Cargar datos por defecto desde el archivo JSON
  private async loadDefaultData(): Promise<void> {
    try {
      const response = await fetch('/json/datos.json');
      const defaultData = await response.json();
      this.dataSubject.next(defaultData);
      this.saveToStorage(defaultData);
    } catch (error) {
      console.error('Error loading default data:', error);
    }
  }

  // Guardar datos en localStorage
  private saveToStorage(data: JsonData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Obtener datos como Observable
  getData(): Observable<JsonData> {
    return this.dataSubject.asObservable();
  }

  // Obtener datos actuales
  getCurrentData(): JsonData {
    return this.dataSubject.value;
  }

  // MÉTODOS PARA SOLICITUDES
  getSolicitudes(): Observable<Solicitud[]> {
    return new Observable(observer => {
      this.dataSubject.subscribe(data => {
        observer.next(data.solicitudes);
      });
    });
  }

  addSolicitud(solicitud: Omit<Solicitud, 'id'>): void {
    const currentData = this.getCurrentData();
    const newId = Math.max(...currentData.solicitudes.map(s => s.id), 0) + 1;
    
    const newSolicitud: Solicitud = {
      ...solicitud,
      id: newId
    };

    const updatedData = {
      ...currentData,
      solicitudes: [...currentData.solicitudes, newSolicitud]
    };

    this.updateData(updatedData);
  }

  updateSolicitud(solicitud: Solicitud): void {
    const currentData = this.getCurrentData();
    const index = currentData.solicitudes.findIndex(s => s.id === solicitud.id);
    
    if (index !== -1) {
      const updatedSolicitudes = [...currentData.solicitudes];
      updatedSolicitudes[index] = solicitud;

      const updatedData = {
        ...currentData,
        solicitudes: updatedSolicitudes
      };

      this.updateData(updatedData);
    }
  }

  deleteSolicitud(id: number): void {
    const currentData = this.getCurrentData();
    const updatedData = {
      ...currentData,
      solicitudes: currentData.solicitudes.filter(s => s.id !== id)
    };

    this.updateData(updatedData);
  }

  // MÉTODOS PARA SERVICIOS
  getServicios(): Observable<Servicio[]> {
    return new Observable(observer => {
      this.dataSubject.subscribe(data => {
        observer.next(data.servicios);
      });
    });
  }

  // MÉTODOS PARA CLIENTES
  getClientes(): Observable<Cliente[]> {
    return new Observable(observer => {
      this.dataSubject.subscribe(data => {
        observer.next(data.clientes);
      });
    });
  }

  // MÉTODOS PARA PROFESIONALES
  getProfesionales(): Observable<Profesional[]> {
    return new Observable(observer => {
      this.dataSubject.subscribe(data => {
        observer.next(data.profesionales);
      });
    });
  }

  // Actualizar todos los datos
  private updateData(newData: JsonData): void {
    this.dataSubject.next(newData);
    this.saveToStorage(newData);
  }

  // Exportar datos actuales como JSON
  exportData(): string {
    return JSON.stringify(this.getCurrentData(), null, 2);
  }

  // Importar datos desde JSON
  importData(jsonString: string): boolean {
    try {
      const importedData = JSON.parse(jsonString);
      this.updateData(importedData);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Resetear a datos por defecto
  async resetToDefault(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    await this.loadDefaultData();
  }
}
