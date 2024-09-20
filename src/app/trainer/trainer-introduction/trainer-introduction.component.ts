import { group } from '@angular/animations';
import { DatePipe, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, Observable, map, catchError, of, pipe } from 'rxjs';
import { TrainerIntrodution, TrainerPricing } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-introduction',
  templateUrl: './trainer-introduction.component.html',
  styleUrls: ['./trainer-introduction.component.css']
})

export class TrainerIntroductionComponent {
  @Output() emitEvent = new EventEmitter();
  updateTrainerIntroductionForm!: FormGroup;
  invalidForm: boolean = false;
  isChecked: boolean = false;
  responseMessage: any;
  selectedImage: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;
  @Input() trainerIntroduction!: TrainerIntrodution;
  selectedCategoriesId: any;
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.trainerIntroduction = this.trainerIntroduction || {};
    this.updateTrainerIntroductionForm = this.formBuilder.group({
      id: this.trainerIntroduction?.id,
      introduction: [this.trainerIntroduction.introduction, Validators.compose([Validators.required, Validators.minLength(500)])],
      coverPhoto: [Validators.required]
    });
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerIntroduction().subscribe(trainerIntroduction => {
        this.trainerIntroduction = trainerIntroduction;
        this.trainerStateService.setMyTrainerIntroductionSubject(trainerIntroduction);
      })
    );
  }

  onImgSelected(event: any): void {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  onCurrentPhotoSelected(event: any) {
    if (event.target.checked) {
      const base64Data = this.trainerIntroduction.coverPhoto;
      if (base64Data) {
        const byteCharacters = atob(base64Data); // Decode base64 data
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const file = new File([blob], 'coverPhoto.jpg', { type: 'image/jpeg' }); // Create a File object
        this.croppedImage = file;
        this.updateTrainerIntroductionForm.get('coverPhoto')?.setErrors(null);
        this.isChecked = true
      }
    } else {
      this.croppedImage = null;
      this.updateTrainerIntroductionForm.get('coverPhoto')?.setValue(null);
    }
  }

  updateFormValues(trainerIntroduction: TrainerIntrodution) {
    this.updateTrainerIntroductionForm.patchValue({
      id: trainerIntroduction.id,
      introduction: trainerIntroduction.introduction,
      coverPhoto: trainerIntroduction.coverPhoto,
    });
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

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  checkTrainerIntroductionExists(): Observable<boolean> {
    return this.trainerStateService.getMyTrainerIntroduction().pipe(
      map((trainerIntroduction: TrainerIntrodution) => {
        return !!trainerIntroduction;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  updateTrainerIntroduction(): void {
    if (this.updateTrainerIntroductionForm.invalid || !this.croppedImage) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    const requestData = new FormData();
    requestData.append('introduction', this.updateTrainerIntroductionForm.get('introduction')?.value);
    requestData.append('coverPhoto', this.croppedImage);

    const trainerIntroduction = this.updateTrainerIntroductionForm.value;


    this.ngxService.start();
    if (this.trainerIntroduction.id) {
      console.log(this.trainerIntroduction.id)
      // Update existing trainer introduction
      requestData.append('id', this.trainerIntroduction.id.toString());
      requestData.append('trainerId', this.trainerIntroduction.trainer.id.toString());
      this.trainerService.updateTrainerIntroduction(requestData)
        .subscribe((response: any) => {
          this.updateTrainerIntroductionForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.showCropper = false
          this.handleEmitEvent()
          this.emitEvent.emit();
          this.updateFormValues(trainerIntroduction);
          this.croppedImage = null;
          this.isChecked = false;
          this.ngxService.stop();
        }, (error: any) => {
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        });
    } else {
      // Add new trainer introduction
      this.trainerService.addTrainerIntroduction(requestData)
        .subscribe((response: any) => {
          this.updateTrainerIntroductionForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.showCropper = false
          this.handleEmitEvent()
          this.updateFormValues(trainerIntroduction);
          this.croppedImage = null;
          this.emitEvent.emit();
          this.ngxService.stop();
        }, (error: any) => {
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        });
    }
  }


  clear() {
    this.updateTrainerIntroductionForm.reset();
  }
}
