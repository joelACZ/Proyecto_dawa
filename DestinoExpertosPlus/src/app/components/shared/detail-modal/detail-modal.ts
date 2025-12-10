import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-detail-modal',
  standalone: true,
  imports: [CommonModule, KeyValuePipe],
  templateUrl: './detail-modal.html',
  styleUrl: './detail-modal.css',
})
export class DetailModal {
  @Input() data: any = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }


  getDisplayValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'SÍ' : 'NO';
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'No especificado';
    }
    if (value instanceof Date) {
      return value.toLocaleString('es-EC');
    }
    return String(value);
  }


  formatKey(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }


  orderByKey(a: any, b: any): number {
    return a.key.localeCompare(b.key);
  }
}