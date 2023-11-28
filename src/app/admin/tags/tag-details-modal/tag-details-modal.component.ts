import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tags } from 'src/app/models/tags.interface';

@Component({
  selector: 'app-tag-details-modal',
  templateUrl: './tag-details-modal.component.html',
  styleUrls: ['./tag-details-modal.component.css']
})
export class TagDetailsModalComponent {
  tagData!: Tags;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TagDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.tagData = this.data.tagData;
  }

  ngOnInit(): void {

  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}

