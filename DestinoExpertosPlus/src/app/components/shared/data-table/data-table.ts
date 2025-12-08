import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet],   
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css']  // ← AGREGA ESTA LÍNEA
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: { field: string; header: string }[] = [];

  @ContentChild('actions', { static: false })
  actionsTemplate!: TemplateRef<any>;
}
