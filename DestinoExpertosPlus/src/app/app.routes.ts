import { Routes } from '@angular/router';
import { CrudClientes } from './components/crud-clientes/crud-clientes';
import { CrudProfesionales } from './components/crud-profesionales/crud-profesionales';
import { CrudResenas } from './components/crud-resenas/crud-resenas';
import { CrudServicios } from './components/crud-servicios/crud-servicios';
import { CrudSolicitudesComponent } from './components/crud-solicitudes/crud-solicitudes';

export const routes: Routes = [
  { path: '', redirectTo: 'crud-solicitudes', pathMatch: 'full' },

  {path:"crud-clientes", component: CrudClientes},
  {path: "crud-profesionales",component: CrudProfesionales},
  {path: "crud-resenas", component: CrudResenas},
  {path: "crud-servicios",component:CrudServicios},
  {path: "crud-solicitudes",component:CrudSolicitudesComponent},

  { path: '**', redirectTo: 'crud-solicitudes' }
];

