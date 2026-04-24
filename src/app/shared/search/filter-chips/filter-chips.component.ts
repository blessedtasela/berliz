import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html'
})
export class FilterChipsComponent {
  @Input() visibleSortOptions: any[] = [];
  @Input() selectedSorts: string[] = [];
  @Input() showMoreButton = false;

  @Output() toggleSort = new EventEmitter<string>();
  @Output() toggleDrawer = new EventEmitter<void>();
}
