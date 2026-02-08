import { Routes } from '@angular/router';
import { CrudClientes } from './components/crud-clientes/crud-clientes';
import { CrudProfesionales } from './components/crud-profesionales/crud-profesionales';
import { CrudResenas } from './components/crud-resenas/crud-resenas';
import { CrudServicios } from './components/crud-servicios/crud-servicios';
import { CrudSolicitudesComponent } from './components/crud-solicitudes/crud-solicitudes';
import { ResenaListComponent } from './components/resena-list/resena-list';
import { MenuComponent } from './components/menu/menu';
import { AuthGuard } from './guards/auth.guard';
import { Login } from './components/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'menu', canActivate: [AuthGuard], component: MenuComponent },
  { path: 'crud-clientes', canActivate: [AuthGuard], component: CrudClientes, data: { roles: ['Administrador'] } },
  { path: 'crud-profesionales', canActivate: [AuthGuard], component: CrudProfesionales, data: { roles: ['Administrador', 'Profesional'] } },
  { path: 'crud-resenas', canActivate: [AuthGuard], component: CrudResenas, data: { roles: ['Administrador', 'Cliente'] } },
  { path: 'crud-servicios', canActivate: [AuthGuard], component: CrudServicios, data: { roles: ['Administrador', 'Profesional'] } },
  { path: 'crud-solicitudes', canActivate: [AuthGuard], component: CrudSolicitudesComponent, data: { roles: ['Administrador', 'Profesional', 'Cliente'] } },
  { path: 'resena-list', component: ResenaListComponent },
  { path: '**', redirectTo: 'login' }
];