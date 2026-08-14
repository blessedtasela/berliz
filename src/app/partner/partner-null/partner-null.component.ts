import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Partner } from 'src/app/models/partners.interface';
import { Role, Users } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PartnerFormComponent } from 'src/app/shared/partner-form/partner-form.component';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-partner-null',
  templateUrl: './partner-null.component.html',
  styleUrls: ['./partner-null.component.css']
})
export class PartnerNullComponent {
  @Input() user!: Users | null;
  profilePhoto: any;
  @Input() partnerData!: Partner;
  @Output() onEmit = new EventEmitter()
  subscriptions: Subscription[] = [];
  roles: Role[] = [{
    id: 1, role: 'center'
  }, {
    id: 2, role: 'trainer'
  },]

  requirements = [
    'A valid fitness or coaching certification (PDF)',
    'An up-to-date resume or CV (PDF)',
    'A motivation statement between 900 and 1200 characters',
    'A Facebook profile URL',
    'An Instagram profile URL',
    'An optional YouTube profile or channel URL',
    'At least 2 feature videos showcasing your expertise',
    'Accurate personal and professional information',
    'Agreement to comply with Berliz trainer standards and policies'
  ];
  constructor(
    private store: Store,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private snackbarService: SnackBarService,
    private partnerService: PartnerService) {
  }

  ngOnInit(): void {

  }

  handleEmitEvent() {
    this.store.dispatch(loadMyPartner());
    this.subscriptions.push(
      this.store.select(selectUser).subscribe((user) => {
        this.user = user;
      }),
      this.store.select(selectMyPartner).subscribe((partner) => {
        if (partner) this.partnerData = partner;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  emitPartner(): void {
    this.handleEmitEvent()
  }


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }


  openPartnerForm(): void {
    const userEmail = this.user?.email;

    if (!userEmail) {
      this.snackbarService.openSnackBar(
        'Please log in to become a partner.',
        'error'
      );
      return;
    }

    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '496px',
      maxWidth: '95vw',
      disableClose: true, // only explicit close button can close it
      data: {
        email: userEmail,
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // only reload when something was actually saved
      if (result === 'saved') {
        this.partnerData = { ...this.partnerData }; // Trigger change detection
      }
    });
  }

}
