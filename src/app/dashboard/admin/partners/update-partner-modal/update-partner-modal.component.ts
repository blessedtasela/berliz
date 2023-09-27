import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Role, Users } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { AddPartnerModalComponent } from '../add-partner-modal/add-partner-modal.component';
import { Partners } from 'src/app/models/partners.interface';
import { UserDataService } from 'src/app/services/user-data.service';


@Component({
  selector: 'app-update-partner-modal',
  templateUrl: './update-partner-modal.component.html',
  styleUrls: ['./update-partner-modal.component.css']
})
export class UpdatePartnerModalComponent {
  onUpdatePartnerEmit = new EventEmitter()
  updatePartnerForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  partnerData: Partners;
  users: Users[] = [];
  responseMessage: any;
  roles: Role[] = [{
    id: 1, role: 'admin'
  }, {
    id: 2, role: 'user'
  }, {
    id: 3, role: 'client'
  }, {
    id: 4, role: 'store'
  }, {
    id: 5, role: 'center'
  }, {
    id: 6, role: 'trainer'
  }, {
    id: 7, role: 'driver'
  },]

  constructor(private formBuilder: FormBuilder,
    private partnerService: PartnerService,
    private userDataService: UserDataService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddPartnerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.partnerData = data.partnerData;
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.updatePartnerForm = this.formBuilder.group({
      'id': new FormControl(this.partnerData?.id, [Validators.required]),
      'email': new FormControl(this.partnerData?.user.email, Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])),
      'motivation': new FormControl(this.partnerData?.motivation, Validators.compose([Validators.required, Validators.minLength(9)])),
      'facebookUrl': new FormControl(this.partnerData?.facebookUrl, Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')])),
      'instagramUrl': new FormControl(this.partnerData?.instagramUrl, Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')])),
      'youtubeUrl': new FormControl(this.partnerData?.youtubeUrl, Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')),
      'role': new FormControl(this.partnerData?.role, [Validators.required, Validators.minLength(3)]),
    });
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a partner')
  }

  toggleIndex(index: number) {
    console.log('index: ', index)
    if (this.updatePartnerForm.get('email')?.invalid ||
      this.updatePartnerForm.get('motivation')?.invalid) {
      this.invalidForm = true;
    } else {
      this.formIndex = + index
    }
  }

  updatePartner(): void {
    this.ngxService.start();
    if (this.updatePartnerForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.partnerService.updatePartner(this.updatePartnerForm.value)
        .subscribe((response: any) => {
          this.updatePartnerForm.reset();
          this.partnerService.setPartnerFormIndex(0);
          this.invalidForm = false;
          this.dialogRef.close('Partner account updated successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onUpdatePartnerEmit.emit();
        }
          , (error: any) => {
            this.ngxService.stop();
            console.error("error");
            if (error.error?.message) {
              this.responseMessage = error.error?.message;
            } else {
              this.responseMessage = genericError;
            }
            this.snackBarService.openSnackBar(this.responseMessage, "error");
          });
    }
    this.ngxService.stop();
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  clear() {
    this.updatePartnerForm.reset();
  }

}
