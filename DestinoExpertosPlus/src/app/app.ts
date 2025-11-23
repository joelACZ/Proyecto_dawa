import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CrudCliente } from "./components/crud-clientes/crud-clientes";

@Component({
  selector: 'app-root',
  imports: [CrudCliente],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('DestinoExpertosPlus');
}
