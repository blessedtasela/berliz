import { Component, EventEmitter, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-user-modal',
  templateUrl: './update-user-modal.component.html',
  styleUrls: ['./update-user-modal.component.css']
})
export class UpdateUserModalComponent {
  onUpdateUser = new EventEmitter();
  updateUserForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  countries: any[] = [];
  responseMessage: any;
  userData: Users;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private countryService: CountryService,
    private router: Router,
    public dialogRef: MatDialogRef<UpdateUserModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.userData = this.data.userData;
     }

    ngOnInit(): void {
      this.formIndex = this.getIndex();
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
      this.userService.setSignupFormIndex(this.formIndex);
    }
  }


  getIndex() {
    const storedIndex = localStorage.getItem("updateUserFormIndex");
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

  updateUser(): void {
    this.ngxService.start();
    if (this.updateUserForm.invalid) {
    this.invalidForm = true
     this.responseMessage = "Invalid form"
     this.ngxService.stop();
    } else {
      this.userService.updateUser(this.updateUserForm.value)
        .subscribe((response: any) => {
          this.updateUserForm.reset();
          this.userService.setSignupFormIndex(0);
          this.invalidForm = false;
          this.dialogRef.close('Account updated successfully');
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
         this.onUpdateUser.emit();
        }
        , (error: any) => {
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

  closeDialog(){
    this.dialogRef.close('Dialog closed without updating account')
  }

  getUser(){
    this.ngxService.stop();
    this.userService.getUser()
    .subscribe((response: any)=>{
      this.userData =response;
      this.updateUserForm.setValue({
        firstname: this.userData.firstname,
        lastname: this.userData.lastname,
        phone: this.userData.phone,
        postalCode: this.userData.postalCode,
        dob: this.userData.dob,
        gender: this.userData.phone,
        country: this.userData.country,
        state: this.userData.state,
        city: this.userData.city,
        address: this.userData.address,
      });
    }, (error)=>{
      this.ngxService.stop();
      console.log(error)
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      } else{
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    })
  }

}

