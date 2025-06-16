
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
import { FileUploadService } from 'src/app/services/test.service';

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
  responseMessage: any;
  @Input() trainerPhotoAlbum!: TrainerPhotoAlbum;
  subscriptions: Subscription[] = [];
  imgCount: number = 0;

  selectedFile: File | null = null;
  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private strapiService: StrapiService,
    private datePipe: DatePipe,
    private fileUploadService: FileUploadService) {
    // Initialize selectedImages with null values
    this.selectedImages = Array(this.MAX_IMAGES).fill(null);
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
  onImageSelected(event: any): void {
    const files: FileList = event.target.files;
    const maxPhotos = 15;

    // Convert FileList to an array and limit to maxPhotos (15)
    const allowedFiles = Array.from(files).slice(0, maxPhotos);

    // Go through the allowed files and add them to the first available empty slot
    for (let i = 0; i < allowedFiles.length; i++) {
      const file = allowedFiles[i];

      // Find the first empty slot in selectedImages array
      const emptyIndex = this.selectedImages.findIndex((img) => !img);

      // If we find an empty index, replace it
      if (emptyIndex !== -1) {
        this.selectedImages[emptyIndex] = file;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews[emptyIndex] = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

    // Count selected images (non-empty ones)
    this.imgCount = this.selectedImages.filter((img) => img).length;

    // If less than 9 images selected, form will be invalid
    this.invalidForm = this.imgCount < 9;
  }


  removeImage(index: number): void {
    this.selectedImages[index] = null;
    this.imagePreviews[index] = '';
    this.imgCount = this.selectedImages.filter((img) => img).length;

    // If less than 9 images selected, form will be invalid
    this.invalidForm = this.imgCount < 9;
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

  updateTrainerPhotoAlbum(): void {
    if (this.updateTrainerPhotoAlbumForm.invalid || this.imgCount < 9) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('comment', this.updateTrainerPhotoAlbumForm.get('comment')?.value);

    // Append each selected image to the FormData
    this.selectedImages
      .filter(img => img !== null)
      .forEach((img: any) => {
        requestData.append('photos', img); // 'photos' must match what your Spring Boot expects
      });

    // If the trainerPhotoAlbum has an ID, update it; otherwise, create a new one
    if (this.trainerPhotoAlbum.id) {
      requestData.append('id', this.trainerPhotoAlbum.id.toString());
      requestData.append('trainerId', this.trainerPhotoAlbum.trainer.id.toString());
      this.trainerService.updateTrainerPhotoAlbum(requestData)
        .subscribe(this.handleSuccess.bind(this), this.handleError.bind(this));
    } else {
      // If no ID, create a new album
      this.trainerService.addTrainerPhotoAlbum(requestData)
        .subscribe(this.handleSuccess.bind(this), this.handleError.bind(this));
    }

  }

  private handleSuccess(response: any): void {
    this.updateTrainerPhotoAlbumForm.reset();
    this.invalidForm = false;
    this.responseMessage = response?.message;
    this.snackBarService.openSnackBar(this.responseMessage, "");
    this.handleEmitEvent();
    this.emitEvent.emit();
    this.updateFormValues(this.updateTrainerPhotoAlbumForm.value);
    this.invalidForm = false;
    this.responseMessage = "";
    this.imageMetadataFromStrapi = [];
    this.imagePreviews = [];
    this.selectedImages = Array(this.MAX_IMAGES).fill(null); // Reset selected images
    this.imgCount = 0; // Reset image count
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

  removeAllImages(): void {
    this.selectedImages = Array(this.MAX_IMAGES).fill(null);
    this.imagePreviews = [];
    this.imgCount = 0; // Reset image count
    this.invalidForm = true; // Set form invalid since no images are selected
  }

  clear() {
    this.updateTrainerPhotoAlbumForm.reset();
    this.removeAllImages();
    this.invalidForm = false;
    this.responseMessage = "";
  }

  // // Method to handle file selection
  // onFileSelected(event: any): void {
  //   this.selectedFile = event.target.files[0];
  // }

  // // Method to upload the selected file
  // onUpload(): void {
  //   if (this.selectedFile) {
  //     this.fileUploadService.uploadFile(this.selectedFile
  //     ).subscribe(
  //       (response) => {
  //         console.log('File uploaded successfully!', response);
  //       },
  //       (error) => {
  //         console.error('Error uploading file:', error);
  //       }
  //     );
  //   }
  // }

}

