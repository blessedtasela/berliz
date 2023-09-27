import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignupModalComponent } from 'src/app/dashboard/user/signup-modal/signup-modal.component';
import { Promotions } from 'src/app/models/promotion.model';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css']
})
export class PromotionsComponent {
  @Input() promotions!: Promotions;

  constructor(private dialog: MatDialog){}

  openSignup() {
    const dialogRef = this.dialog.open(SignupModalComponent, {
      width: '800px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
