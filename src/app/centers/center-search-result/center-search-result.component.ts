import { Component, Input, SimpleChanges } from '@angular/core';
import { Centers } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-search-result',
  templateUrl: './center-search-result.component.html',
  styleUrls: ['./center-search-result.component.css']
})
export class CenterSearchResultComponent {
  @Input() centersResult: Centers[] = [];
  @Input() countResult: number = 0;
  showAllCenters: boolean = false;
  filteredCenters: Centers[] = [];

  constructor(){  }

  allCenters(){
    this.showAllCenters = !this.showAllCenters;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('results' in changes) {
      this.filteredCenters = changes['results'].currentValue;
    }
  }

   // format the trainer's name for the URL
   formatCenterName(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }
}
