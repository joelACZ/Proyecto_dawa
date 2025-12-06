import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
@Component({
  selector: 'app-menu.',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu..html',
  styleUrl: './menu..css',
})
export class MenuComponent  implements OnInit, OnDestroy{
 showSidebar = false;
  private routerSubscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    // Detectar cambios de ruta para mostrar/ocultar sidebar
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        // Mostrar sidebar solo si NO estamos en el menu o ruta raíz
        this.showSidebar = !event.url.includes('/menu') && event.url !== '/' && event.url !== '';
      });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
