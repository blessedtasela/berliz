import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { fromEvent, map, debounceTime, tap, switchMap, distinctUntilChanged } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-search',
  templateUrl: './center-search.component.html',
  styleUrls: ['./center-search.component.css']
})
export class CenterSearchComponent {
  searchQuery: string = '';
  countResult: number = 0;
  showResults: boolean = false;

  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() results: EventEmitter<Centers[]> = new EventEmitter<Centers[]>();

 
}
