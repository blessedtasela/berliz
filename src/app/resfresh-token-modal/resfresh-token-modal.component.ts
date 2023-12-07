import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-resfresh-token-modal',
  templateUrl: './resfresh-token-modal.component.html',
  styleUrls: ['./resfresh-token-modal.component.css']
})
export class ResfreshTokenModalComponent {
  onEmitStatusChange = new EventEmitter();
  details: any;

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<ResfreshTokenModalComponent>) { }
    
  ngOnInit(): void {
    if (this.dialogData && this.dialogData.confirmation) {
      this.details = this.dialogData;
    }
  }

  refreshToken() {
    this.onEmitStatusChange.emit();
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without performing any action');
  }

}
