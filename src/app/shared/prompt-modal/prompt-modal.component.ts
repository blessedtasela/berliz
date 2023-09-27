import { DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-prompt-modal',
  templateUrl: './prompt-modal.component.html',
  styleUrls: ['./prompt-modal.component.css']
})
export class PromptModalComponent implements OnInit {
  onEmitStatusChange = new EventEmitter();
  details: any;

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<PromptModalComponent>) { }
  ngOnInit(): void {
    if (this.dialogData && this.dialogData.confirmation) {
      this.details = this.dialogData;
    }
  }

  handleChangeAction() {
    this.onEmitStatusChange.emit();
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without performing any action');
  }
}
