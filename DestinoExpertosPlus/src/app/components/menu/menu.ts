import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent {
  menuItems = [
    { path: '/crud-clientes', title: 'Clientes', icon: 'bi-people', description: 'Gestión de usuarios clientes' },
    { path: '/crud-servicios', title: 'Servicios', icon: 'bi-briefcase', description: 'Administrar servicios ofrecidos' },
    { path: '/crud-resenas', title: 'Reseñas', icon: 'bi-star', description: 'Ver y gestionar reseñas' },
    { path: '/crud-profesionales', title: 'Profesionales', icon: 'bi-person-badge', description: 'Gestión de profesionales' },
    { path: '/crud-solicitudes', title: 'Solicitudes', icon: 'bi-journal-text', description: 'Panel de solicitudes' },
  ];

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}