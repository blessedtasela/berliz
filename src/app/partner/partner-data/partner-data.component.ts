import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { UpdatePartnerFileModalComponent } from 'src/app/shared/update-partner-file-modal/update-partner-file-modal.component';
import { Partner } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Role } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-partner-data',
  templateUrl: './partner-data.component.html',
  styleUrls: ['./partner-data.component.css']
})
export class PartnerDataComponent {
  @Input() partnerData!: Partner;
  @Output() onEmit = new EventEmitter;
  updatePartnerForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  responseMessage: any;
  subscriptions: Subscription[] = []
  roles: Role[] = [{
    id: 1, role: 'center'
  }, {
    id: 2, role: 'trainer'
  },]

  constructor(private datePipe: DatePipe,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder,
    private partnerService: PartnerService,
    private store: Store,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updatePartnerForm = this.formBuilder.group({
      'id': this.partnerData?.id,
      'motivation': [this.partnerData?.motivation, Validators.compose([Validators.required, Validators.minLength(9)])],
      'facebookUrl': [this.partnerData?.facebookUrl, Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')])],
      'instagramUrl': [this.partnerData?.instagramUrl, Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')])],
      'youtubeUrl': [this.partnerData?.youtubeUrl, Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')],
      'role': [this.partnerData?.role, [Validators.required, Validators.minLength(3)]],
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.store.dispatch(loadMyPartner());
    this.subscriptions.push(this.store.select(selectMyPartner).subscribe((partner) => {
      if (partner) this.partnerData = partner;
      this.cd.detectChanges();
    }),
    );
    this.ngxService.stop();
  }

  updateFormValues(partner: Partner) {
    this.updatePartnerForm.patchValue({
      id: partner.id,
      motivation: partner.motivation,
      role: partner.role,
      facebookUrl: partner.facebookUrl,
      instagramUrl: partner.instagramUrl,
      youtubeUrl: partner.youtubeUrl
    });
  }
  openUrl(url: any) {
    window.open(url, '_blank');
  }

  openViewResume() {
    const dialogRef = this.dialog.open(ViewCvModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        partnerData: this.partnerData,
      },
      panelClass: 'mat-dialog-height',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without any action');
      }
    });
  }

  openViewCertification() {
    const dialogRef = this.dialog.open(ViewCvModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        partnerData: this.partnerData,
      },
      panelClass: 'mat-dialog-height',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without any action');
      }
    });
  }

  openUpdateFile() {
    const dialogRef = this.dialog.open(UpdatePartnerFileModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        partnerData: this.partnerData,
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdatePartnerFileModalComponent;
    childComponentInstance.onUpdatePartnerFileEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updating file');
      }
    });
  }

  updatePartner(): void {
    if (this.updatePartnerForm.invalid) {
      this.invalidForm = true;

      if (this.updatePartnerForm.invalid) {
        this.snackBarService.openSnackBar('Please fix the form before submitting.', 'error');
        return;
      }

      this.ngxService.start();

      const payload = {
        id: this.updatePartnerForm.get('id')?.value,
        certificationUrl: this.partnerData?.certificationUrl,
        resumeUrl: this.partnerData?.resumeUrl,
        email: this.partnerData?.email,
        motivation: this.partnerData?.motivation,
        facebookUrl: this.partnerData?.facebookUrl,
        instagramUrl: this.partnerData?.instagramUrl,
        youtubeUrl: this.partnerData?.youtubeUrl,
        role: this.partnerData?.role
      };

      this.partnerService.updateFile(payload).subscribe({
        next: (res: any) => {
          this.ngxService.stop();

          this.snackBarService.openSnackBar(res?.message ?? 'Partner updated successfully', '');
          this.updateFormValues(res);
        },
        error: (err: any) => {
          this.ngxService.stop();
          this.snackBarService.openSnackBar(err?.error?.message ?? genericError, 'error');
        }
      });
    }
  }

  clear() {
    this.updatePartnerForm.reset();
  }

}
