
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, Observable, map, catchError, of } from 'rxjs';
import { TrainerPhotoAlbum } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError, videoSizeValidator } from 'src/validators/form-validators.module';
import { DatePipe } from '@angular/common';
import { StrapiService } from 'src/app/services/strapi.service';

@Component({
  selector: 'app-trainer-photo-album',
  templateUrl: './trainer-photo-album.component.html',
  styleUrls: ['./trainer-photo-album.component.css']
})
export class TrainerPhotoAlbumComponent {
  MAX_IMAGES = 15;
  imagePreviews: string[] = [];
  selectedImages: (File | null)[] = [];
  imageMetadataFromStrapi: any[] = [];
  indexArray = Array.from({ length: this.MAX_IMAGES }, (_, i) => i); // Generates [0, 1, ..., 14]

  @Output() emitEvent = new EventEmitter();
  updateTrainerPhotoAlbumForm!: FormGroup;
  invalidForm: boolean = false;
  isChecked: boolean = false;
  responseMessage: any;
  selectedVideo: any;
  @Input() trainerPhotoAlbum!: TrainerPhotoAlbum;
  subscriptions: Subscription[] = [];
  imgCount: number = 0;
  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private strapiService: StrapiService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    console.log(this.trainerPhotoAlbum)
    this.trainerPhotoAlbum = this.trainerPhotoAlbum || {};
    this.updateTrainerPhotoAlbumForm = this.formBuilder.group({
      id: this.trainerPhotoAlbum?.id,
      comment: [this.trainerPhotoAlbum.comment, Validators.compose([Validators.required, Validators.minLength(500)])],
      trainer: this.trainerPhotoAlbum.trainer,
    });

  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onImageSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImages[index] = file;
      this.imgCount = this.selectedImages.filter(img => !!img).length;
      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.selectedImages[index] = null;
    this.imagePreviews[index] = '';
  }

  get isSaveDisabled(): boolean {
    const commentValid = this.updateTrainerPhotoAlbumForm.get('comment')?.valid;
    const selectedImagesCount = this.selectedImages.filter(img => !!img).length;
    return !(commentValid && selectedImagesCount >= 9);
  }


  handleEmitEvent() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerPhotoAlbum().subscribe(trainerPhotoAlbum => {
        this.trainerPhotoAlbum = trainerPhotoAlbum;
        this.trainerStateService.setMyTrainerPhotoAlbumsSubject(trainerPhotoAlbum);
      })
    );
  }


  updateFormValues(trainerPhotoAlbum: TrainerPhotoAlbum) {
    this.updateTrainerPhotoAlbumForm.patchValue({
      id: trainerPhotoAlbum.id,
      comment: trainerPhotoAlbum.comment,
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  uploadImagesToStrapi(): Promise<any[]> {
    const uploadPromises = this.selectedImages
      .filter((file): file is File => file !== null) // type guard: ensures 'file' is File, not null
      .map(file => {
        const formData = new FormData();
        formData.append('files', file); // now this is safe
        return this.strapiService.uploadToStrapi(formData).toPromise();
      });

    return Promise.all(uploadPromises);
  }

  updateTrainerPhotoAlbum(): void {
    if (this.updateTrainerPhotoAlbumForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    if (this.selectedVideo === null) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please select or input video";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    const validationError = videoSizeValidator(this.selectedVideo);
    if (validationError) {
      this.invalidForm = true;
      this.responseMessage = validationError['videoSizeError'];
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    this.ngxService.start();

    this.uploadImagesToStrapi().then(uploadedImageResponses => {
      // Flatten and extract image metadata (URLs, IDs, etc.)
      const uploadedImageMetadata = uploadedImageResponses.map(resp => resp[0]); // If each response returns an array

      const requestData = new FormData();
      requestData.append('motivation', this.updateTrainerPhotoAlbumForm.get('motivation')?.value);
      requestData.append('video', this.selectedVideo);

      // Attach image metadata (as JSON string, or however your backend expects it)
      requestData.append('images', JSON.stringify(uploadedImageMetadata));

      const trainerPhotoAlbum = this.updateTrainerPhotoAlbumForm.value;

      if (this.trainerPhotoAlbum.id) {
        requestData.append('id', this.trainerPhotoAlbum.id.toString());
        requestData.append('trainerId', this.trainerPhotoAlbum.trainer.id.toString());
        this.trainerService.updateTrainerPhotoAlbum(requestData)
          .subscribe(this.handleSuccess.bind(this), this.handleError.bind(this));
      } else {
        this.trainerService.addTrainerPhotoAlbum(requestData)
          .subscribe(this.handleSuccess.bind(this), this.handleError.bind(this));
      }
    }).catch(err => {
      console.error('Image upload failed', err);
      this.responseMessage = "Failed to upload image(s)";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    });
  }

  private handleSuccess(response: any): void {
    this.updateTrainerPhotoAlbumForm.reset();
    this.invalidForm = false;
    this.responseMessage = response?.message;
    this.snackBarService.openSnackBar(this.responseMessage, "");
    this.handleEmitEvent();
    this.emitEvent.emit();
    this.updateFormValues(this.updateTrainerPhotoAlbumForm.value);
    this.isChecked = false;
    this.ngxService.stop();
  }

  private handleError(error: any): void {
    console.error("error", error);
    if (error.error?.message) {
      this.responseMessage = error.error?.message;
    } else {
      this.responseMessage = "An unexpected error occurred.";
    }
    this.snackBarService.openSnackBar(this.responseMessage, "error");
    this.ngxService.stop();
  }


  clear() {
    this.updateTrainerPhotoAlbumForm.reset();
  }
}
