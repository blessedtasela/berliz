import { Component, Input } from '@angular/core';
import { Offers } from 'src/app/models/offers.model';

@Component({
    selector: 'app-offers',
    templateUrl: './offers.component.html',
    styleUrls: ['./offers.component.css'],
    standalone: false
})
export class OffersComponent {
  @Input() offers!: Offers;
}
