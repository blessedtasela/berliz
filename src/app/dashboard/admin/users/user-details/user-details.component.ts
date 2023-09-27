import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Users } from 'src/app/models/users.interface';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent {
  userData!: Users;
  responseMessage: any;
  profilePhoto: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UserDetailsComponent>,
    private datePipe: DatePipe) {
    this.userData = this.data.userData;
    this.profilePhoto =  this.data.photo;
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