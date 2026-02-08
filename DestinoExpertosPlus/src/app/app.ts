import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, CommonModule] // ← SOLO ESTOS
})
export class App {
  showSidebar = true;
  currentRoute: string = '';
  
  constructor(public auth: AuthService, private router: Router) {
    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.showSidebar = !this.currentRoute.includes('/login');
        
        console.log('📍 Ruta actual:', this.currentRoute);
        window.scrollTo(0, 0);
      });
  }

  isLoginPage(): boolean {
    return this.currentRoute.includes('/login');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Método para navegar manualmente (backup)
  goToRoute(route: string): void {
    console.log('🚀 Navegando a:', route);
    this.router.navigate([route]);
  }
}