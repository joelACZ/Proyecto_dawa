import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet, CommonModule],   
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css'] 
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: { field: string; header: string }[] = [];

  @ContentChild('actions', { static: false })
  actionsTemplate!: TemplateRef<any>;
}
