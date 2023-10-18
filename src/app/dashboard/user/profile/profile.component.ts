import { Component, Input } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { UserStateService } from 'src/app/services/user-state.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  @Input() user!: Users;
  responseMessage: any;
  subscription = new Subscription;
  selectedImage: any;
  bioForm!: FormGroup;

  constructor(private userService: UserService,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.bioForm = this.formBuilder.group({
      bio: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
  
  handleEmitEvent() {
    this.ngxService.start();
    this.subscription.add(
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user)
      }),
    );
    this.ngxService.stop()
  }

  onImgSelected(event: any, id: number): void {
    this.selectedImage = event.target.files[0];
    console.log("onSelectedImage", this.selectedImage)
    this.updateProfilePhoto(id)
  }

  updateProfilePhoto(id: number): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('id', id.toLocaleString());
    requestData.append('photo', this.selectedImage);
    this.userService.updateProfilePhoto(requestData)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  updateBio(): void {
    this.ngxService.start();
    this.userService.updateBio(this.bioForm.value)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
