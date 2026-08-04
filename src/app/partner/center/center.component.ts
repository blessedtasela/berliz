import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { UpdateCenterModalComponent } from 'src/app/admin/centers/update-center-modal/update-center-modal.component';
import { Centers } from 'src/app/models/centers.interface';
import { Partner } from 'src/app/models/partners.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectCenterEquipment, selectCurrentCenter } from 'src/app/state/center/center.selectors';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center',
  templateUrl: './center.component.html',
  styleUrls: ['./center.component.css']
})
export class CenterComponent {
  @Input() centerData!: Centers | null;
  @Input() user!: Users | null;
  @Input() partnerData!: Partner | null;
  @Output() onEmit = new EventEmitter;
  subscriptions: Subscription[] = [];
  responseMessage: any;
  invalidForm: boolean = false;
  selectedImage: any;
  updateCenterPhotoForm!: FormGroup;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;

  constructor(
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private store: Store,
    private datePipe: DatePipe,
    private formbuilder: FormBuilder,
    private centerService: CenterService,
    private snackBarService: SnackBarService,) { }

  ngOnInit(): void {
    this.updateCenterPhotoForm = this.formbuilder.group({
      'photo': ['', [Validators.required, fileValidator]],
      'id': [this.centerData?.id],
    })
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.store.select(selectCurrentCenter).subscribe((center) => {
        this.centerData = center;
      }),
      // this.store.select(selectPartner).subscribe((partner) => {
      //   this.partnerData = partner;
      //   this.partnerStateService.setPartnerSubject(partner);
      // })
    );
    this.ngxService.stop();
  }

  emitData(): void {
    this.handleEmitEvent()
    console.log('data emitted: ')
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openUpdateCenter() {
    const dialogRef = this.dialog.open(UpdateCenterModalComponent, {
      width: '800px',
      data: {
        centerData: this.centerData,
      },
      panelClass: 'mat-dialog-height',
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateCenterModalComponent;
    childComponentInstance.onUpdateCenterEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updating partner');
      }
    });
  }

    onImgSelected(event: any): void {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  // submitForm(): void {
  //   this.ngxService.start();
  //   const requestData = new FormData();
  //   requestData.append('id', this.updateCenterPhotoForm.get('id')?.value);
  //   requestData.append('photo', this.selectedImage);
  //   this.centerService.updatePhoto(requestData)
  //     .subscribe(
  //       (response: any) => {
  //         this.ngxService.stop();
  //         this.responseMessage = response?.message;
  //         this.snackBarService.openSnackBar(this.responseMessage, "");
  //         this.handleEmitEvent()
  //         this.onEmit.emit()
  //       }, (error: any) => {
  //         this.ngxService.stop();
  //         console.error("error");
  //         if (error.error?.message) {
  //           this.responseMessage = error.error?.message;
  //         } else {
  //           this.responseMessage = genericError;
  //         }
  //         this.snackBarService.openSnackBar(this.responseMessage, 'error');
  //       });
  // }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
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

  // openUpdateCoverPhoto() {
  //   const dialogRef = this.dialog.open(UpdateCenterPhotoModalComponent, {
  //     width: '400px',
  //     data: {
  //       centerData: this.centerData,
  //     },
  //     panelClass: 'mat-dialog-height',
  //   });
  //   const childComponentInstance = dialogRef.componentInstance as UpdateCenterPhotoModalComponent;
  //   childComponentInstance.onUpdatePhotoEmit.subscribe(() => {
  //     this.handleEmitEvent();
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       console.log(`Dialog result: ${result}`);
  //     } else {
  //       console.log('Dialog closed without updating partner');
  //     }
  //   });
  // }

  updatePhoto(): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('id', this.updateCenterPhotoForm.get('id')?.value);
    requestData.append('photo', this.croppedImage);
    this.centerService.updateCenterPhoto(requestData)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.showCropper = false;
          this.handleEmitEvent()
          this.onEmit.emit()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
        });
  }

}
