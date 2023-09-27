import { Component, Input } from '@angular/core';
import { CenterEquipment } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-equipments',
  templateUrl: './center-equipments.component.html',
  styleUrls: ['./center-equipments.component.css']
})
export class CenterEquipmentsComponent {
 @Input() centerEquipments: CenterEquipment | undefined;
  showAllEquipments: boolean = false;

  constructor() {
  }

  allEquipments() {
    this.showAllEquipments = !this.showAllEquipments;
  }
}
