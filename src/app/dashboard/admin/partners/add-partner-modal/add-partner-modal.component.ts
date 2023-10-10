import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Role, Users } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { emailExtensionValidator, fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-partner-modal',
  templateUrl: './add-partner-modal.component.html',
  styleUrls: ['./add-partner-modal.component.css'],
})
export class AddPartnerModalComponent implements AfterViewInit {
  onAddPartnerEmit = new EventEmitter();
  addPartnerForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  users: Users[] = [];
  responseMessage: any;
  selectedCV: any;
  selectedCertificate: any;
  roles: Role[] = [{
    id: 1, role: 'admin'
  }, {
    id: 2, role: 'user'
  }, {
    id: 3, role: 'client'
  }, {
    id: 4, role: 'partner'
  }, {
    id: 5, role: 'store'
  }, {
    id: 6, role: 'center'
  }, {
    id: 7, role: 'trainer'
  }, {
    id: 8, role: 'driver'
  },]

  constructor(private fb: FormBuilder,
    private partnerService: PartnerService,
    private userStateService: UserStateService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddPartnerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.addPartnerForm = this.fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      'certificate': ['', [Validators.required, fileValidator]],
      'motivation': ['', Validators.compose([Validators.required, Validators.minLength(9)])],
      'cv': ['', Validators.compose([Validators.required, fileValidator])],
      'facebookUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')])],
      'instagramUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')])],
      'youtubeUrl': ['', Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')],
      'role': ['', [Validators.required, Validators.minLength(3)]],
    });

    this.userStateService.getAllUsers().subscribe((user) => {
      this.ngxService.start();
      this.users = user;
      this.ngxService.stop();
    });

  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a partner')
  }

  toggleIndex(index: number) {
    console.log('index: ', index)
    if (this.addPartnerForm.get('email')?.invalid ||
      this.addPartnerForm.get('certificate')?.invalid ||
      this.addPartnerForm.get('motivation')?.invalid ||
      this.addPartnerForm.get('cv')?.invalid) {
      this.invalidForm = true;
    } else {
      this.formIndex = + index
    }
  }


  onCVSelected(event: any): void {
    this.selectedCV = event.target.files[0];
  }

  onCertificateSelected(event: any): void {
    this.selectedCertificate = event.target.files[0];
  }


  addPartner(): void {
    this.ngxService.start();
    this.ngxService.stop()
    const requestData = new FormData();
    requestData.append('email', this.addPartnerForm.get('email')?.value);
    requestData.append('certificate', this.selectedCertificate);
    requestData.append('motivation', this.addPartnerForm.get('motivation')?.value);
    requestData.append('cv', this.selectedCV);
    requestData.append('facebookUrl', this.addPartnerForm.get('facebookUrl')?.value);
    requestData.append('instagramUrl', this.addPartnerForm.get('instagramUrl')?.value);
    requestData.append('youtubeUrl', this.addPartnerForm.get('youtubeUrl')?.value);
    requestData.append('role', this.addPartnerForm.get('role')?.value);

    if (this.addPartnerForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.partnerService.addPartner(requestData)
        .subscribe((response: any) => {
          this.addPartnerForm.reset();
          this.partnerService.setPartnerFormIndex(0);
          this.invalidForm = false;
          this.dialogRef.close('Partner account added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onAddPartnerEmit.emit();
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
    this.addPartnerForm.reset();
  }

}




