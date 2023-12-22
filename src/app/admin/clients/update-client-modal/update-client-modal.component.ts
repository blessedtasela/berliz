import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-update-client-modal',
  templateUrl: './update-client-modal.component.html',
  styleUrls: ['./update-client-modal.component.css']
})
export class UpdateClientModalComponent {
onUpdateClientEmit = new EventEmitter()
}
