import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, Observable, map, catchError, of } from 'rxjs';
import { TrainerVideoAlbum } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { videoSizeValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-video-album',
  templateUrl: './trainer-video-album.component.html',
  styleUrls: ['./trainer-video-album.component.css']
})
export class TrainerVideoAlbumComponent {


  @Output() emitEvent = new EventEmitter();
  updateTrainerVideoAlbum!: FormGroup;
  invalidForm: boolean = false;
  isChecked: boolean = false;
  responseMessage: any;
  selectedVideo: any;
  @Input() trainerVideoAlbum!: TrainerVideoAlbum;
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    console.log(this.trainerVideoAlbum)
    this.trainerVideoAlbum = this.trainerVideoAlbum || {};
    this.updateTrainerVideoAlbum = this.formBuilder.group({
      id: this.trainerVideoAlbum?.id,
      comment: [this.trainerVideoAlbum.comment, Validators.compose([Validators.required, Validators.minLength(500)])],
      video: [null, Validators.required]
    });

  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerVideoAlbum().subscribe(trainerVideoAlbum => {
        this.trainerVideoAlbum = trainerVideoAlbum;
        this.trainerStateService.setMyTrainerVideoAlbumsSubject(trainerVideoAlbum);
      })
    );
  }

  onVidSelected(event: any): void {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      this.selectedVideo = file; // Store the file in selectedVideo
      this.updateTrainerVideoAlbum.patchValue({
        video: file // Update the form control with the file
      });
      this.updateTrainerVideoAlbum.get('video')?.updateValueAndValidity(); // Update validity
    }
  }

  onCurrentVideoSelected(event: any) {
    if (event.target.checked) {

      const videoUrl = this.trainerVideoAlbum?.videoResponses?.[0]?.videoUrl;

      if (videoUrl) {
        fetch(videoUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.blob();
          })
          .then(blob => {
            const file = new File([blob], 'video.mp4', { type: 'video/mp4' });
            this.selectedVideo = file;

            this.updateTrainerVideoAlbum.patchValue({
              video: file
            });

            this.updateTrainerVideoAlbum.get('video')?.updateValueAndValidity();
            this.isChecked = false;
          })
          .catch(error => {
            console.error('Error fetching video:', error);
          });
      }

    } else {
      this.updateTrainerVideoAlbum.get('video')?.setValue(null);
      this.isChecked = false;
    }
  }

  updateFormValues(trainerVideoAlbum: TrainerVideoAlbum) {
    this.updateTrainerVideoAlbum.patchValue({
      id: trainerVideoAlbum.id,
      comment: trainerVideoAlbum.comment,
      video: trainerVideoAlbum.videoResponses,
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  checktrainerVideoAlbumExists(): Observable<boolean> {
    return this.trainerStateService.getMyTrainerVideoAlbum().pipe(
      map((trainerVideoAlbum: TrainerVideoAlbum) => {
        return !!trainerVideoAlbum;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }


  updatetrainerVideoAlbum(): void {
    if (this.updateTrainerVideoAlbum.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    } else if (this.selectedVideo === null) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please select or input video";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }


    const validationError = videoSizeValidator(this.selectedVideo);

    if (validationError) {
      this.invalidForm = true;
      this.responseMessage = validationError['videoSizeError'];  // Use the validation error message
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    const requestData = new FormData();
    requestData.append('comment', this.updateTrainerVideoAlbum.get('comment')?.value);
    requestData.append('video', this.selectedVideo);

    const trainerVideoAlbum = this.updateTrainerVideoAlbum.value;


    this.ngxService.start();
    if (this.trainerVideoAlbum.id) {
      console.log(this.trainerVideoAlbum.id)
      // Update existing trainer comment
      requestData.append('id', this.trainerVideoAlbum.id.toString());
      requestData.append('trainerId', this.trainerVideoAlbum.trainerId.toString());
      this.trainerService.updateTrainerVideoAlbum(requestData)
        .subscribe((response: any) => {
          this.updateTrainerVideoAlbum.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
          this.emitEvent.emit();
          this.updateFormValues(trainerVideoAlbum);
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
      // Add new trainer comment
      this.trainerService.addTrainerVideoAlbum(requestData)
        .subscribe((response: any) => {
          this.updateTrainerVideoAlbum.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
          this.updateFormValues(trainerVideoAlbum);
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
    this.updateTrainerVideoAlbum.reset();
  }
}

