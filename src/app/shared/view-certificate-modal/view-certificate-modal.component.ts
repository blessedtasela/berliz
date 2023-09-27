import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Partners } from 'src/app/models/partners.interface';

@Component({
  selector: 'app-view-certificate-modal',
  templateUrl: './view-certificate-modal.component.html',
  styleUrls: ['./view-certificate-modal.component.css']
})
export class ViewCertificateModalComponent {
  certificate: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewCertificateModalComponent>,) {
    this.certificate = this.data.partnerData;
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

}
