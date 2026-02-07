import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}


     canActivate(route: ActivatedRouteSnapshot): boolean {
        //autenticacion 
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

//autorizacion por roles
  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const userRole = this.authService.getUserRole();


if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    alert('Acceso denegado: tu rol no tiene permiso.');
    this.router.navigate(['/movie-list']);
    return false;
  }
    return true;
  }
}
