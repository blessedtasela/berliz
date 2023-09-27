import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { Users } from 'src/app/models/users.interface';
import { PartnerDataService } from 'src/app/services/partner-data.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { PartnerFormModalComponent } from 'src/app/shared/partner-form-modal/partner-form-modal.component';

@Component({
  selector: 'app-trainer-header',
  templateUrl: './trainer-header.component.html',
  styleUrls: ['./trainer-header.component.css']
})
export class TrainerHeaderComponent {
  partner!: Partners;
  user!: Users;

  constructor(private dialog: MatDialog,
    private partnerDataService: PartnerDataService,
    private ngxService: NgxUiLoaderService,
    private userDataService: UserDataService,
    private router: Router) { }

  ngOnInit() {
    this.userDataService.getUser().subscribe(() => {
      this.user = this.userDataService.userData;
    })
  }

  handleEmitEvent() {
    this.partnerDataService.getPartner().subscribe(() => {
      this.ngxService.start()
      this.partner = this.partnerDataService.partnerData;

      this.ngxService.stop()
    });
  }

  openAddPartner() {
    if (!this.user) {
      window.alert("Please log in to continue")
      this.router.navigate(['/login'])
    } else {
      const dialogRef = this.dialog.open(PartnerFormModalComponent, {
        width: '800px',
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as PartnerFormModalComponent;

      // Set the event emitter before closing the dialog
      childComponentInstance.onAddPartnerEmit.subscribe(() => {
        this.handleEmitEvent();
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without performing any action');
        }
      });
    }
  }

}
