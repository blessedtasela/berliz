import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Members } from 'src/app/models/members.interface';

@Component({
  selector: 'app-member-details-modal',
  templateUrl: './member-details-modal.component.html',
  styleUrls: ['./member-details-modal.component.css']
})
export class MemberDetailsModalComponent {
  memberData!: Members;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MemberDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.memberData = this.data.memberData;
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
