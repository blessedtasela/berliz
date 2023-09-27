import { Component, Input } from '@angular/core';
import { CenterLocation } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-locations',
  templateUrl: './center-locations.component.html',
  styleUrls: ['./center-locations.component.css']
})
export class CenterLocationsComponent {
  @Input() centerLoction: CenterLocation | undefined;
  showAllLocations: boolean = false;
  
  constructor() {
  
  }
  
  allLocations() {
    this.showAllLocations = !this.showAllLocations;
  }
}
