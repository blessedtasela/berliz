import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-cv-modal',
  templateUrl: './view-cv-modal.component.html',
  styleUrls: ['./view-cv-modal.component.css']
})
export class ViewCvModalComponent {
  cv: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewCvModalComponent>,) {
    this.cv = this.data.partnerData;
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }
}
