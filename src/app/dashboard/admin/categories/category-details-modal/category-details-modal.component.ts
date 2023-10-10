import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categories } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-details-modal',
  templateUrl: './category-details-modal.component.html',
  styleUrls: ['./category-details-modal.component.css']
})
export class CategoryDetailsModalComponent {
  categoryData!: Categories;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CategoryDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.categoryData = this.data.categoryData;
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
