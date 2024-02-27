import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {
  @Input() user!: Users;
  responseMessage: any;
  subscriptions: Subscription[] = [];
  selectedImage: any;
  bioForm!: FormGroup;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;
  @Input() profileData: any;

  constructor(private userService: UserService,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private rxStompService: RxStompService,) { }

  ngOnInit(): void {
    this.bioForm = this.formBuilder.group({
      bio: ['', Validators.required]
    });
    this.handleEmitEvent()
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user)
      }),
    );
    this.ngxService.stop()
  }

  onImgSelected(event: any): void {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
  }

  imageLoaded() {
    // This method is called when the image is loaded in the cropper
    // You can perform any actions you need when the image is loaded, such as displaying the cropper
  }

  cropperReady() {
    // This method is called when the cropper is ready
    // You can perform any actions you need when the cropper is ready
  }

  loadImageFailed() {
    // This method is called if there is an error loading the image in the cropper
    // You can handle the error and display a message to the user
  }

  cancelUpload() {
    this.showCropper = false;
  }

  updatePhoto(): void {
    this.ngxService.start();
    const id = this.user.id;
    const photo = this.croppedImage;
    const requestData = new FormData();
    requestData.append('profilePhoto', photo);
    requestData.append('id', id.toString());
    this.userService.updateProfilePhoto(requestData)
      .subscribe((response: any) => {
        this.ngxService.stop();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, "");
        this.showCropper = false;
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
