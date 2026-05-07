import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html'
})
export class SearchBarComponent {
  @Input() query = '';
  @Output() queryChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Input() placeholder: string = 'Search...';
}
