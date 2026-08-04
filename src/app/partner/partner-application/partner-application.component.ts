import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partner } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterFormModalComponent } from 'src/app/shared/center-form-modal/center-form-modal.component';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { Store } from '@ngrx/store';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-partner-application',
  templateUrl: './partner-application.component.html',
  styleUrls: ['./partner-application.component.css']
})
export class PartnerApplicationComponent {
  @Input() partnerData!: Partner;
  @Input() user!: Users | null;
  @Input() center!: Centers | null;
  @Input() trainer!: Trainers | null;
  @Output() onEmit = new EventEmitter;
  responseMessage: any;
  subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private datePipe: DatePipe) { }

  ngOnInit(): void { }

  handleEmitEvent() {
    this.ngxService.start();
    this.store.dispatch(loadMyPartner());
    this.subscriptions.push(
      this.store.select(selectMyPartner).subscribe((partner) => {
        if (partner) this.partnerData = partner;
      })
    );
    this.ngxService.stop();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  emitPartner(): void {
    this.handleEmitEvent()
  }

  openApplicationForm() {
    if (this.partnerData.role === 'trainer') {
      const dialogRef = this.dialog.open(TrainerFormModalComponent, {
        width: '800px',
        data: {
          partnerData: this.partnerData,
        },
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as TrainerFormModalComponent;
      childComponentInstance.onAddTrainerEmit.subscribe(() => {
        this.handleEmitEvent()
        this.onEmit.emit()
      });
    }
    if (this.partnerData.role === 'center') {
      const dialogRef = this.dialog.open(CenterFormModalComponent, {
        width: '800px',
        data: {
          partnerData: this.partnerData,
        },
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as CenterFormModalComponent;
      childComponentInstance.onAddCenterEmit.subscribe(() => {
        this.handleEmitEvent()
        this.onEmit.emit()
      });
    }
  }


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

}
