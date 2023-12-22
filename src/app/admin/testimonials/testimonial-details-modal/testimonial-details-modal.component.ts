import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Testimonials } from 'src/app/models/testimonials.model';

@Component({
  selector: 'app-testimonial-details-modal',
  templateUrl: './testimonial-details-modal.component.html',
  styleUrls: ['./testimonial-details-modal.component.css']
})
export class TestimonialDetailsModalComponent {
  testimonialData!: Testimonials;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TestimonialDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.testimonialData = this.data.testimonialData;
  }

  ngOnInit(): void {

  }

  openUrl(url: any){
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
