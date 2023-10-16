import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { Users } from 'src/app/models/users.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { PartnerFormModalComponent } from 'src/app/shared/partner-form-modal/partner-form-modal.component';

@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  styleUrls: ['./center-header.component.css']
})
export class CenterHeaderComponent {
  partner!: Partners;
  user!: Users;

  constructor(private dialog: MatDialog,
    private partnerDataService: PartnerStateService,
    private ngxService: NgxUiLoaderService,
    private userStateService: UserStateService,
    private router: Router) { }

  ngOnInit() {
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    })
  }

  handleEmitEvent() {
    this.partnerDataService.getPartner().subscribe((partnerData) => {
      this.ngxService.start()
      this.partner =partnerData;
      this.ngxService.stop()
    });
  }

  openAddPartner() {
    if (!this.user) {
      window.alert("Please log in to continue")
      this.router.navigate(['/login'])
    } else {
      const dialogRef = this.dialog.open(PartnerFormModalComponent, {
        width: '900px',
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
