import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partner } from 'src/app/models/partners.interface';
import { Users } from 'src/app/models/users.interface';
import { PartnerFormModalComponent } from 'src/app/shared/partner-form-modal/partner-form-modal.component';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  styleUrls: ['./center-header.component.css']
})
export class CenterHeaderComponent {
  partner!: Partner;
  user!: Users | null;

  constructor(private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private store: Store,
    private router: Router) { }

  ngOnInit() {
    this.store.select(selectUser).subscribe((user) => {
      this.user = user;
    })
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadMyPartner());
    this.store.select(selectMyPartner).subscribe((partnerData) => {
      if (partnerData) this.partner = partnerData;
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
