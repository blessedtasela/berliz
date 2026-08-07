import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Newsletter } from 'src/app/models/newsletter.model';

@Component({
  selector: 'app-newsletter-details-modal',
  templateUrl: './newsletter-details-modal.component.html',
  styleUrls: ['./newsletter-details-modal.component.css']
})
export class NewsletterDetailsModalComponent {
  newsletterData!: Newsletter;
  responseMessage: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NewsletterDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.newsletterData = this.data.newsletterData;
  }

  ngOnInit(): void {

  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}
