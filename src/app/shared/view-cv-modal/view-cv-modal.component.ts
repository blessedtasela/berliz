import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { IconsModule } from 'src/app/icons/icons.module';

@Component({
    selector: 'app-view-cv-modal',
    templateUrl: './view-cv-modal.component.html',
    styleUrls: ['./view-cv-modal.component.css'],
    imports: [CommonModule, IconsModule, NgxExtendedPdfViewerModule]
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
