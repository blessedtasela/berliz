import { Component, Input } from '@angular/core';
import { CenterLocations } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-locations',
  templateUrl: './center-locations.component.html',
  styleUrls: ['./center-locations.component.css']
})
export class CenterLocationsComponent {
  @Input() centerLocations: CenterLocations[] = [];
  showAllLocations: boolean = false;
  
  constructor() {
  
  }
  
  allLocations() {
    this.showAllLocations = !this.showAllLocations;
  }
}
