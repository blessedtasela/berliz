import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-bio-edit',
  templateUrl: './user-bio-edit.component.html',
  styleUrls: ['./user-bio-edit.component.css']
})
export class UserBioEditComponent {

  @Input() form!: FormGroup;
  @Output() save = new EventEmitter<void>();

  onSaveClick() {
    this.save.emit();
  }
}