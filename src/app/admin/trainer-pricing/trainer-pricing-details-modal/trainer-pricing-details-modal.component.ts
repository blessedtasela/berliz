import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TrainerPricing } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-pricing-details-modal',
  templateUrl: './trainer-pricing-details-modal.component.html',
  styleUrls: ['./trainer-pricing-details-modal.component.css']
})
export class TrainerPricingDetailsModalComponent {
  trainerPricingData!: TrainerPricing;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TrainerPricingDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.trainerPricingData = this.data.trainerPricingData;
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
