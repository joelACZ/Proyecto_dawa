import { Component, Input } from '@angular/core';
import { Servicio } from '../../models/Servicio.model';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './cards.html',
})
export class CardComponent {
  @Input() servicio!: Servicio;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() content: string = '';
}
