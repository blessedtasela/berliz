import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignupModalComponent } from '../signup-modal/signup-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
 
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(SignupModalComponent, {
      backdropClass: 'dialog-backdrop',
      panelClass: 'dialog-panel',
  
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  
}
