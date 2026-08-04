import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

import {
  loadUser,
  updateUserBio,
  updateUserProfilePhoto
} from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';


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
    private store: Store,
    private ngx: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.bioForm = this.fb.group({
      bio: ['', [Validators.required, Validators.minLength(900), Validators.maxLength(1200)]]
    });

    this.loadUserFromStore();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ---------------------------
  // USER FROM STORE
  // ---------------------------
  loadUserFromStore(): void {
    this.store.dispatch(loadUser());

    const sub = this.store.select(selectUser).subscribe(user => {
      if (!user) return;

      this.user = user;
      this.bioForm.patchValue({ bio: user.bio || '' });
    });

    this.subscriptions.push(sub);
  }

  // ---------------------------
  // PHOTO
  // ---------------------------
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

    this.store.dispatch(updateUserProfilePhoto({ data: form }));

    // you should handle success via effect → snackbar
    this.ngx.stop();
    this.showCropper = false;
  }

  onCancelCrop(): void {
    this.showCropper = false;
    this.imageChangedEvent = '';
    this.croppedImage = null;
  }

  // ---------------------------
  // BIO
  // ---------------------------
  onSaveBio(): void {
    if (this.bioForm.invalid) return;

    this.ngx.start();

    this.store.dispatch(updateUserBio({ data: this.bioForm.value }));

    this.ngx.stop();
    this.bioForm.markAsPristine();
    this.bioForm.markAsUntouched();
  }

  // ---------------------------
  // UTILS
  // ---------------------------
  formatDate(dateString: any): string | null {
    return this.datePipe.transform(new Date(dateString), 'dd/MM/yyyy');
  }
}