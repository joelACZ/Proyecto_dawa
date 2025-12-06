import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/shared/cards/cards';
import { DataTableComponent } from './components/shared/data-table/data-table';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    RouterModule,
    CommonModule,

  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('DestinoExpertosPlus');
  showSidebar = false;

  constructor(private router: Router) {
    // Detectar cambios de ruta para mostrar/ocultar sidebar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Mostrar sidebar solo si NO estamos en el menu o ruta raíz
        this.showSidebar = !event.url.includes('/menu') && event.url !== '/' && event.url !== '';
      });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}