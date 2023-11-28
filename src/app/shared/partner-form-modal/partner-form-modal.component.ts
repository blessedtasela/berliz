import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';import { AddPartnerModalComponent } from 'src/app/admin/partners/add-partner-modal/add-partner-modal.component';
import { Role, Users } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-partner-form-modal',
  templateUrl: './partner-form-modal.component.html',
  styleUrls: ['./partner-form-modal.component.css']
})
export class PartnerFormModalComponent {
  onAddPartnerEmit = new EventEmitter();
  addPartnerForm!: FormGroup;
  formIndex: number = 0;
  invalidForm: boolean = false;
  user!: Users;
  responseMessage: any;
  selectedCV: any;
  selectedCertificate: any;
  roles: Role[] = [{
    id: 1, role: 'store'
  }, {
    id: 2, role: 'center'
  }, {
    id: 3, role: 'trainer'
  }, {
    id: 4, role: 'driver'
  },]

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private userStateService: UserStateService,
    public dialogRef: MatDialogRef<AddPartnerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private partnerService: PartnerService,) { }

  ngOnInit(): void {
    this.addPartnerForm = this.fb.group({
      'certificate': ['', Validators.compose([Validators.required, fileValidator])],
      'motivation': ['', Validators.compose([Validators.required, Validators.minLength(9)])],
      'cv': ['', Validators.compose([Validators.required, fileValidator])],
      'facebookUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')])],
      'instagramUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')])],
      'youtubeUrl': ['', Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')],
      'role': ['', [Validators.required, Validators.minLength(3)]],
    });

    this.userStateService.allUsersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.user = cachedData
      } else {
        this.handleEmitEvent();
      }
    })

  }

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.ngxService.start()
      this.user = user;
      this.userStateService.setUserSubject(this.user);
      this.ngxService.stop()
    });
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a partner')
  }

  onCVSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedCV = event.target.files[0];
    }
  }

  onCertificateSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedCertificate = event.target.files[0];
    }
  }

  toggleIndex(index: number) {
    console.log('index: ', index)
    if (
      this.addPartnerForm.get('certificate')?.invalid ||
      this.addPartnerForm.get('motivation')?.invalid ||
      this.addPartnerForm.get('cv')?.invalid) {
      this.invalidForm = true;
    } else {
      this.formIndex += index;
    }
  }

  addPartner(): void {
    const requestData = new FormData();
    requestData.append('email', this.user?.email);
    requestData.append('certificate', this.selectedCertificate);
    requestData.append('motivation', this.addPartnerForm.get('motivation')?.value);
    requestData.append('cv', this.selectedCV);
    requestData.append('facebookUrl', this.addPartnerForm.get('facebookUrl')?.value);
    requestData.append('instagramUrl', this.addPartnerForm.get('instagramUrl')?.value);
    requestData.append('youtubeUrl', this.addPartnerForm.get('youtubeUrl')?.value);
    requestData.append('role', this.addPartnerForm.get('role')?.value);

    if (this.addPartnerForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
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
        }, (error: any) => {
          this.ngxService.start();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        })
    }
  }

  clear() {
    this.addPartnerForm.reset();
  }
}
