import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CenterPromotions } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-promotions',
  templateUrl: './center-promotions.component.html',
  styleUrls: ['./center-promotions.component.css']
})
export class CenterPromotionsComponent {
@Input() centerPromotions: CenterPromotions | undefined;
@Output() scrollToSubscriptionForm: EventEmitter<boolean> = new EventEmitter<boolean>();

scrollToForm(){
this.scrollToSubscriptionForm.emit(true);
console.log('scroll to form clicked')
}
}
