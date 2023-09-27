import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryService } from 'src/app/services/country.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { emailExtensionValidator, genericError, fileValidator, passwordMatchValidator } from 'src/validators/form-validators.module';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-signup-modal',
  templateUrl: './signup-modal.component.html',
  styleUrls: ['./signup-modal.component.css'],
})

export class SignupModalComponent {
  onSignupEmit = new EventEmitter();
  signUpForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  countries: any[] = [];
  responseMessage: any;
  selectedImage: any;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private countryService: CountryService,
    private router: Router,
    public dialogRef: MatDialogRef<SignupModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) { }

  ngOnInit(): void {
    this.formIndex = this.getIndex();
    this.getCountriesData();
    this.signUpForm = this.fb.group({
      'firstname': ['', [Validators.required, Validators.minLength(2)]],
      'lastname': ['', [Validators.required, Validators.minLength(2)]],
      'phone': ['', Validators.compose([Validators.required, Validators.minLength(9)])],
      'postalCode': ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      'dob': ['', Validators.required],
      'gender': ['', Validators.required],
      'country': ['', Validators.required],
      'state': ['', [Validators.required, Validators.minLength(3)]],
      'city': ['', [Validators.required, Validators.minLength(3)]],
      'address': ['', [Validators.required, Validators.minLength(8)]],
      'profilePhoto': ['', [Validators.required, fileValidator]],
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      'confirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    }
      , { validator: passwordMatchValidator })

  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding account')
  }
  validateImage(input: HTMLInputElement) {
    const file = input.files && input.files[0];

    if (file) {
      this.signUpForm.get('imageUrl')?.updateValueAndValidity();
    }
  }

  toggleFirstIndex(n: number) {
    if (
      this.signUpForm.get('firstname')?.invalid ||
      this.signUpForm.get('lastName')?.invalid ||
      this.signUpForm.get('phone')?.invalid ||
      this.signUpForm.get('dob')?.invalid ||
      this.signUpForm.get('gender')?.invalid
    ) {
      this.invalidForm = true;
      console.log("Can't validate");
    } else {
      this.formIndex += n;
      this.userService.setLoginFormIndex(this.formIndex);
    }
  }

  toggleSecondIndex(n: number) {
    if (
      this.signUpForm.get('country')?.invalid ||
      this.signUpForm.get('state')?.invalid ||
      this.signUpForm.get('city')?.invalid ||
      this.signUpForm.get('postalCode')?.invalid ||
      this.signUpForm.get('address')?.invalid ||
      this.signUpForm.get('profilePhoto')?.invalid
    ) {
      this.invalidForm = true
      console.log("can't validate");
    } else
      this.formIndex += n;
    this.userService.setLoginFormIndex(this.formIndex);
  }

  toggleThirdIndex(n: number) {
    if (
      this.signUpForm.get('email')?.invalid ||
      this.signUpForm.get('password')?.invalid ||
      this.signUpForm.get('confirmPassword')?.invalid
    ) {
      this.invalidForm = true
      console.log("can't validate");
    } else
      this.formIndex += n;
    this.userService.setLoginFormIndex(this.formIndex);
  }

  toggleIndex(n: number) {
    this.formIndex += n;
    this.userService.setLoginFormIndex(this.formIndex);
  }

  getIndex() {
    const storedIndex = localStorage.getItem("signUpFormIndex");
    const index = storedIndex ? parseInt(storedIndex, 10) : 0;
    console.log('Current form Index: ', index);
    return index;
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

  onImgSelected(event: any): void {
    this.selectedImage = event.target.files[0];
  }

  submitForm(): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('firstname', this.signUpForm.get('firstname')?.value);
    requestData.append('lastname', this.signUpForm.get('lastname')?.value);
    requestData.append('phone', this.signUpForm.get('phone')?.value);
    requestData.append('postalCode', this.signUpForm.get('postalCode')?.value);
    requestData.append('dob', this.signUpForm.get('dob')?.value);
    requestData.append('gender', this.signUpForm.get('gender')?.value);
    requestData.append('country', this.signUpForm.get('country')?.value);
    requestData.append('state', this.signUpForm.get('state')?.value);
    requestData.append('city', this.signUpForm.get('city')?.value);
    requestData.append('address', this.signUpForm.get('address')?.value);
    requestData.append('profilePhoto', this.selectedImage);
    requestData.append('email', this.signUpForm.get('email')?.value);
    requestData.append('password', this.signUpForm.get('password')?.value);

    if (this.signUpForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.userService.signup(requestData)
        .subscribe((response: any) => {
          this.signUpForm.reset();
          this.userService.setLoginFormIndex(0);
          this.invalidForm = false;
          this.dialogRef.close('User account added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.router.navigate(['/login']);
          this.onSignupEmit.emit();
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
    this.signUpForm.reset();
  }

}



