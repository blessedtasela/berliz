import { Component, Input } from '@angular/core';
import { Promotions } from 'src/app/models/promotion.model';

@Component({
  selector: 'app-promotions-list',
  templateUrl: './promotions-list.component.html',
  styleUrls: ['./promotions-list.component.css']
})
export class PromotionsListComponent {
  @Input() promotionsList: Promotions[] = [];
}
