import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-legal-details',
  templateUrl: './legal-details.component.html',
  styleUrls: ['./legal-details.component.css']
})
export class LegalDetailsComponent {
  @Input() section!: 'terms' | 'guidelines';
  @Output() close = new EventEmitter<void>();
}
