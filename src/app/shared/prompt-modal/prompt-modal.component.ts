import { DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromptData } from 'src/app/models/Prompt.interface';

@Component({
  selector: 'app-prompt-modal',
  templateUrl: './prompt-modal.component.html',
  styleUrls: ['./prompt-modal.component.css']
})
export class PromptModalComponent implements OnInit {
  onEmitStatusChange = new EventEmitter();
  details!: PromptData;

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: PromptData,
    public dialogRef: MatDialogRef<PromptModalComponent>) { }

  ngOnInit(): void {
    // `confirmation` just decides whether a Cancel button is offered alongside
    // Confirm/OK -- a plain informational alert (no confirmation) is just as
    // valid a use of this modal and shouldn't be dropped here.
    this.details = this.dialogData || {};
  }

  handleChangeAction() {
    this.onEmitStatusChange.emit(true);
    this.dialogRef.close(true);
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
