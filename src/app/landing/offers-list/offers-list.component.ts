import { Component, Input } from '@angular/core';
import { Offers } from 'src/app/models/offers.model';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.css']
})
export class OffersListComponent {
  @Input() offersList: Offers[] = [];
}
