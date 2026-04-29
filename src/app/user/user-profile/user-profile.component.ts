import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  @Input() user!: Users;
  @Input() profileData: any;

  bioForm!: FormGroup;
  imageChangedEvent: any = '';
  croppedImage: Blob | null = null;
  showCropper = false;

  responseMessage: any;
  subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private userStateService: UserStateService,
    private ngx: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.bioForm = this.fb.group({
      bio: ['', Validators.required]
    });
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadUser(): void {
    const sub = this.userStateService.getUser().subscribe(user => {
      this.user = user;
      this.userStateService.setUserSubject(user);
      this.bioForm.patchValue({ bio: user.bio || '' });
    });
    this.subscriptions.push(sub);
  }

  onImgSelected(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  onPhotoCropped(blob: Blob): void {
    this.croppedImage = blob;
  }

  onPhotoUpload(): void {
    if (!this.croppedImage || !this.user?.id) return;

    this.ngx.start();
    const form = new FormData();
    form.append('profilePhoto', this.croppedImage);
    form.append('id', this.user.id.toString());

    this.userService.updateProfilePhoto(form).subscribe({
      next: (res: any) => {
        this.ngx.stop();
        this.responseMessage = res?.message;
        this.snackbar.openSnackBar(this.responseMessage, '');
        this.showCropper = false;
        this.loadUser();
      },
      error: (error: any) => {
        this.ngx.stop();
        this.responseMessage = error.error?.message || genericError;
        this.snackbar.openSnackBar(this.responseMessage, 'error');
      }
    });
  }

  onCancelCrop(): void {
    this.showCropper = false;
    this.imageChangedEvent = '';
    this.croppedImage = null;
  }

  onSaveBio(): void {
    if (this.bioForm.invalid) return;

    this.ngx.start();
    this.userService.updateBio(this.bioForm.value).subscribe({
      next: (res: any) => {
        this.ngx.stop();
        this.responseMessage = res?.message;
        this.snackbar.openSnackBar(this.responseMessage, '');
        this.loadUser();
      },
      error: (error: any) => {
        this.ngx.stop();
        this.responseMessage = error.error?.message || genericError;
        this.snackbar.openSnackBar(this.responseMessage, 'error');
      }
    });
  }

  formatDate(dateString: any): string | null {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}