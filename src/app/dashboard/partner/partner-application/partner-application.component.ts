import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { CenterFormModalComponent } from 'src/app/shared/center-form-modal/center-form-modal.component';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';

@Component({
  selector: 'app-partner-application',
  templateUrl: './partner-application.component.html',
  styleUrls: ['./partner-application.component.css']
})
export class PartnerApplicationComponent {
  @Input() partnerData!: Partners;
  @Input() user!: Users;
  @Input() center!: Centers;
  @Input() trainer!: Trainers;
  @Output() onEmit = new EventEmitter;
  responseMessage: any;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerStateService: PartnerStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private datePipe: DatePipe) { }

  ngOnInit(): void { }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.partnerStateService.getPartner().subscribe((partner) => {
        this.partnerData = partner;
        this.partnerStateService.setPartnerSubject(partner);
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
