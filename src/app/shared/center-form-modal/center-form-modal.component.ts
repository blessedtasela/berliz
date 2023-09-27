import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-center-form-modal',
  templateUrl: './center-form-modal.component.html',
  styleUrls: ['./center-form-modal.component.css']
})
export class CenterFormModalComponent {
onAddCenterEmit = new EventEmitter()
}
