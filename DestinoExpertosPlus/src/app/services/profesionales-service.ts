import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Profesional } from '../models/Profesional.model';

@Injectable({
  providedIn: 'root'
})
export class ServProfesionalesJson {
  private profesionalesUrl = 'http://localhost:3000/profesionales';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los profesionales
   */
  getProfesionales(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      catchError(this.handleError<Profesional[]>('getProfesionales', []))
    );
  }

  /**
   * Obtener un profesional por ID
   */
  getProfesionalById(id: number): Observable<Profesional> {
    const url = `${this.profesionalesUrl}/${id}`;
    return this.http.get<Profesional>(url).pipe(
      catchError(this.handleError<Profesional>(`getProfesionalById id=${id}`))
    );
  }

  /**
   * Buscar profesionales por múltiples campos
   */
  searchProfesionales(param: string): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      map(profesionales => {
        if (!param.trim()) {
          return profesionales;
        }
        
        const searchTerm = param.toLowerCase();
        return profesionales.filter(p =>
          (p.nombre && p.nombre.toLowerCase().includes(searchTerm)) ||
          (p.email && p.email.toLowerCase().includes(searchTerm)) ||
          (p.especialidad && p.especialidad.toLowerCase().includes(searchTerm)) ||
          (p.telefono && p.telefono.toString().includes(searchTerm)) ||
          (p.ubicacion && p.ubicacion.toLowerCase().includes(searchTerm)) ||
          (Array.isArray(p.oficios) && p.oficios.some(oficio => 
            oficio.toLowerCase().includes(searchTerm)
          ))
        );
      }),
      catchError(this.handleError<Profesional[]>('searchProfesionales', []))
    );
  }

  /**
   * Crear un nuevo profesional
   */
  create(profesional: Profesional): Observable<Profesional> {
    // Asegurar que los oficios sean un array
    const profesionalToCreate = {
      ...profesional,
      oficios: Array.isArray(profesional.oficios) 
        ? profesional.oficios 
        : (profesional.oficios ? [profesional.oficios] : [])
    };
    
    return this.http.post<Profesional>(this.profesionalesUrl, profesionalToCreate).pipe(
      catchError(this.handleError<Profesional>('create'))
    );
  }

  /**
   * Actualizar un profesional existente (PUT - reemplazo completo)
   */
  update(profesional: Profesional): Observable<Profesional> {
    const url = `${this.profesionalesUrl}/${profesional.id}`;
    
    // Asegurar que los oficios sean un array
    const profesionalToUpdate = {
      ...profesional,
      oficios: Array.isArray(profesional.oficios) 
        ? profesional.oficios 
        : (profesional.oficios ? [profesional.oficios] : [])
    };
    
    return this.http.put<Profesional>(url, profesionalToUpdate).pipe(
      catchError(this.handleError<Profesional>('update'))
    );
  }

  /**
   * Actualización parcial de un profesional (PATCH)
   */
  updatePartial(id: number, changes: Partial<Profesional>): Observable<Profesional> {
    const url = `${this.profesionalesUrl}/${id}`;
    return this.http.patch<Profesional>(url, changes).pipe(
      catchError(this.handleError<Profesional>('updatePartial'))
    );
  }

  /**
   * Eliminar un profesional
   */
  delete(id: number): Observable<Profesional> {
    const url = `${this.profesionalesUrl}/${id}`;
    return this.http.delete<Profesional>(url).pipe(
      catchError(this.handleError<Profesional>('delete'))
    );
  }

  /**
   * Filtrar profesionales por especialidad
   */
  getByEspecialidad(especialidad: string): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      map(profesionales =>
        profesionales.filter(p => 
          p.especialidad && p.especialidad.toLowerCase() === especialidad.toLowerCase()
        )
      ),
      catchError(this.handleError<Profesional[]>('getByEspecialidad', []))
    );
  }

  /**
   * Obtener solo profesionales disponibles
   */
  getDisponibles(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      map(profesionales =>
        profesionales.filter(p => p.disponibilidad === true)
      ),
      catchError(this.handleError<Profesional[]>('getDisponibles', []))
    );
  }

  /**
   * Obtener profesionales no disponibles
   */
  getNoDisponibles(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      map(profesionales =>
        profesionales.filter(p => p.disponibilidad === false)
      ),
      catchError(this.handleError<Profesional[]>('getNoDisponibles', []))
    );
  }

  /**
   * Filtrar por experiencia mínima (en años)
   */
  getByExperienciaMinima(anios: number): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      map(profesionales =>
        profesionales.filter(p => p.experiencia >= anios)
      ),
      catchError(this.handleError<Profesional[]>('getByExperienciaMinima', []))
    );
  }

  /**
   * Buscar por ubicación
   */
  searchByUbicacion(ubicacion: string): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.profesionalesUrl).pipe(
      map(profesionales =>
        profesionales.filter(p => 
          p.ubicacion && p.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
        )
      ),
      catchError(this.handleError<Profesional[]>('searchByUbicacion', []))
    );
  }

  /**
   * Obtener estadísticas de profesionales
   */
  getEstadisticas(): Observable<{
    total: number;
    disponibles: number;
    noDisponibles: number;
    porEspecialidad: Record<string, number>;
    experienciaPromedio: number;
  }> {
    return this.getProfesionales().pipe(
      map(profesionales => {
        const total = profesionales.length;
        const disponibles = profesionales.filter(p => p.disponibilidad).length;
        const noDisponibles = total - disponibles;
        
        // Contar por especialidad
        const porEspecialidad: Record<string, number> = {};
        profesionales.forEach(p => {
          const esp = p.especialidad || 'Sin especificar';
          porEspecialidad[esp] = (porEspecialidad[esp] || 0) + 1;
        });
        
        // Calcular experiencia promedio
        const experienciaTotal = profesionales.reduce((sum, p) => sum + (p.experiencia || 0), 0);
        const experienciaPromedio = total > 0 ? experienciaTotal / total : 0;
        
        return {
          total,
          disponibles,
          noDisponibles,
          porEspecialidad,
          experienciaPromedio: Math.round(experienciaPromedio * 10) / 10
        };
      }),
      catchError(this.handleError<any>('getEstadisticas', {}))
    );
  }

  /**
   * Cambiar disponibilidad de un profesional
   */
  toggleDisponibilidad(id: number): Observable<Profesional> {
    return this.getProfesionalById(id).pipe(
      map(profesional => ({
        ...profesional,
        disponibilidad: !profesional.disponibilidad
      })),
      map(updatedProfesional => {
        // Actualizar en el servidor
        return this.update(updatedProfesional);
      }),
      catchError(this.handleError<Profesional>('toggleDisponibilidad'))
    ) as Observable<Profesional>;
  }

  /**
   * Verificar si un email ya está registrado
   */
  checkEmailExists(email: string, excludeId?: number): Observable<boolean> {
    return this.getProfesionales().pipe(
      map(profesionales =>
        profesionales.some(p => 
          p.email.toLowerCase() === email.toLowerCase() && 
          (!excludeId || p.id !== excludeId)
        )
      ),
      catchError(this.handleError<boolean>('checkEmailExists', false))
    );
  }

  /**
   * Verificar si un teléfono ya está registrado
   */
  checkTelefonoExists(telefono: string, excludeId?: number): Observable<boolean> {
    return this.getProfesionales().pipe(
      map(profesionales =>
        profesionales.some(p => 
          p.telefono.toString() === telefono && 
          (!excludeId || p.id !== excludeId)
        )
      ),
      catchError(this.handleError<boolean>('checkTelefonoExists', false))
    );
  }

  /**
   * Obtener todas las especialidades únicas
   */
  getEspecialidades(): Observable<string[]> {
    return this.getProfesionales().pipe(
      map(profesionales => {
        const especialidades = profesionales
          .map(p => p.especialidad)
          .filter(especialidad => especialidad && especialidad.trim() !== '');
        
        return [...new Set(especialidades)];
      }),
      catchError(this.handleError<string[]>('getEspecialidades', []))
    );
  }

  /**
   * Obtener todos los oficios únicos
   */
  getOficios(): Observable<string[]> {
    return this.getProfesionales().pipe(
      map(profesionales => {
        const allOficios: string[] = [];
        
        profesionales.forEach(p => {
          if (Array.isArray(p.oficios)) {
            p.oficios.forEach(oficio => {
              if (oficio && oficio.trim() !== '') {
                allOficios.push(oficio.trim());
              }
            });
          }
        });
        
        return [...new Set(allOficios)];
      }),
      catchError(this.handleError<string[]>('getOficios', []))
    );
  }

  /**
   * Manejo de errores genérico
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Puedes personalizar el manejo de errores según el tipo de error
      let errorMessage = 'Ocurrió un error';
      
      if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 400) {
        errorMessage = 'Solicitud incorrecta';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor';
      }
      
      // Devuelve un resultado seguro para que la aplicación continúe
      return throwError(() => new Error(errorMessage));
    };
  }
}