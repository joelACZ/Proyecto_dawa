import { Routes } from '@angular/router';
import { CrudClientes } from './components/crud-clientes/crud-clientes';
import { CrudProfesionales } from './components/crud-profesionales/crud-profesionales';
import { CrudResenas } from './components/crud-resenas/crud-resenas';
import { CrudServicios } from './components/crud-servicios/crud-servicios';
import { CrudSolicitudesComponent } from './components/crud-solicitudes/crud-solicitudes';
import { ResenaListComponent } from './components/resena-list/resena-list';
import { MenuComponent } from './components/menu/menu';

export const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' }, // Raíz → Menú
  { path: 'menu', component: MenuComponent },          // Pantalla principal
  { path: 'crud-clientes', component: CrudClientes },
  { path: 'crud-profesionales', component: CrudProfesionales },
  { path: 'crud-resenas', component: CrudResenas },
  { path: 'crud-servicios', component: CrudServicios },
  { path: 'crud-solicitudes', component: CrudSolicitudesComponent },
  { path: 'resena-list', component: ResenaListComponent },
  { path: '**', redirectTo: 'menu' }                 // 404 → Menú
];