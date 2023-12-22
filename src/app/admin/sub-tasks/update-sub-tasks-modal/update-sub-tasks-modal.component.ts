import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-update-sub-tasks-modal',
  templateUrl: './update-sub-tasks-modal.component.html',
  styleUrls: ['./update-sub-tasks-modal.component.css']
})
export class UpdateSubTasksModalComponent {
onUpdateSubTaskEmit = new EventEmitter()
}
