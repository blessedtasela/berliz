import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-admin-update-user-modal',
  templateUrl: './admin-update-user-modal.component.html',
  styleUrls: ['./admin-update-user-modal.component.css']
})
export class AdminUpdateUserModalComponent {
  onUpdateUserEmit = new EventEmitter();
  updateUserForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  countries: any[] = [];
  responseMessage: any;
  userData: any;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private countryService: CountryService,
    public dialogRef: MatDialogRef<AdminUpdateUserModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userData = this.data.userData;
  }

  ngOnInit(): void {
    this.getCountriesData();
    this.updateUserForm = this.fb.group({
      'id': new FormControl(this.userData?.id, [Validators.required]),
      'firstname': new FormControl(this.userData?.firstname, [Validators.required, Validators.minLength(2)]),
      'lastname': new FormControl(this.userData?.lastname, [Validators.required, Validators.minLength(2)]),
      'phone': new FormControl(this.userData?.phone, Validators.compose([Validators.required, Validators.minLength(9)])),
      'postalCode': new FormControl(this.userData?.postalCode, Validators.compose([Validators.required, Validators.minLength(5)])),
      'dob': new FormControl(this.userData?.dob, Validators.required),
      'gender': new FormControl(this.userData?.gender, Validators.required),
      'country': new FormControl(this.userData?.country, Validators.required),
      'state': new FormControl(this.userData?.state, [Validators.required, Validators.minLength(3)]),
      'city': new FormControl(this.userData?.city, [Validators.required, Validators.minLength(3)]),
      'address': new FormControl(this.userData?.address, [Validators.required, Validators.minLength(8)]),
    });
  }


  toggleIndex(n: number) {
    if (
      this.updateUserForm.get('firstname')?.invalid ||
      this.updateUserForm.get('lastName')?.invalid ||
      this.updateUserForm.get('phone')?.invalid ||
      this.updateUserForm.get('dob')?.invalid ||
      this.updateUserForm.get('gender')?.invalid
    ) {
      this.invalidForm = true;
      console.log("Can't validate");
    } else {
      this.formIndex += n;
    }
  }

  getCountriesData() {
    // get the data from countryService
    this.countryService.getCountriesData().subscribe((response: any) => {
      // Process the response data
      this.countries = response.map((country: any) => {
        return {
          name: country.name.common,
          states: country?.subdivisions ? Object.keys(country.subdivisions) : []
        };
      });
    });
  }

  updateUserAdmin(): void {
    this.ngxService.start();
    if (this.updateUserForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.userService.updateSuperUser(this.updateUserForm.value)
        .subscribe((response: any) => {
          this.updateUserForm.reset();
          this.userService.setLoginFormIndex(0);
          this.invalidForm = false;
          this.dialogRef.close();
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.onUpdateUserEmit.emit();
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating user\'s account')
  }

  clear() {
    this.updateUserForm.reset();
  }

}