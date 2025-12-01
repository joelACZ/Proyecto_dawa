import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CardComponent } from './components/shared/cards/cards';
import { DataTableComponent } from './components/shared/data-table/data-table';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet , RouterLink , RouterLinkActive , RouterModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('DestinoExpertosPlus');
}
 