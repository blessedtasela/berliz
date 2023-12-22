import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-update-members-modal',
  templateUrl: './update-members-modal.component.html',
  styleUrls: ['./update-members-modal.component.css']
})
export class UpdateMembersModalComponent {
onUpdateMemberEmit = new EventEmitter()
}
