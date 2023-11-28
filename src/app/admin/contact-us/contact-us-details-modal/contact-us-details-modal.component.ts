import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactUs } from 'src/app/models/contact-us.model';

@Component({
  selector: 'app-contact-us-details-modal',
  templateUrl: './contact-us-details-modal.component.html',
  styleUrls: ['./contact-us-details-modal.component.css']
})
export class ContactUsDetailsModalComponent {
  contactUs!: ContactUs;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ContactUsDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.contactUs = this.data.contactUs;
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

