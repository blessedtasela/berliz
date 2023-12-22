import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubTasks } from 'src/app/models/tasks.interface';

@Component({
  selector: 'app-sub-task-details-modal',
  templateUrl: './sub-task-details-modal.component.html',
  styleUrls: ['./sub-task-details-modal.component.css']
})
export class SubTaskDetailsModalComponent {
  subTaskData!: SubTasks;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SubTaskDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.subTaskData = this.data.subTaskData;
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
