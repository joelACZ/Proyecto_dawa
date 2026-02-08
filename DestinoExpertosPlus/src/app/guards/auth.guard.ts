import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Permitir acceso a rutas públicas
    if (route.routeConfig?.path === 'login' || 
        route.routeConfig?.path === 'resena-list') {
      return true;
    }

    // 1. Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Verificar autorización por roles
    const allowedRoles = route.data?.['roles'] as string[] | undefined;
    const userRole = this.authService.getUserRole();

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
      alert(`Acceso denegado: tu rol (${userRole}) no tiene permiso.`);
      
      // Redirigir según el rol del usuario
      switch(userRole) {
        case 'Administrador':
          this.router.navigate(['/menu']);
          break;
        case 'Profesional':
          this.router.navigate(['/crud-solicitudes']);
          break;
        case 'Cliente':
          this.router.navigate(['/crud-solicitudes']);
          break;
        default:
          this.router.navigate(['/menu']);
      }
      
      return false;
    }

    return true;
  }
}