import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, Observable, map, catchError, of } from 'rxjs';
import { TrainerFeatureVideo } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-feature-videos',
  templateUrl: './trainer-feature-videos.component.html',
  styleUrls: ['./trainer-feature-videos.component.css']
})
export class TrainerFeatureVideosComponent implements OnInit{
  @Output() emitEvent = new EventEmitter();
  updateTrainerFeatureVideoForm!: FormGroup;
  invalidForm: boolean = false;
  isChecked: boolean = false;
  responseMessage: any;
  selectedVideo: any;
  @Input() trainerFeatureVideo!: TrainerFeatureVideo;
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    console.log(this.trainerFeatureVideo)
    this.trainerFeatureVideo = this.trainerFeatureVideo || {};
    this.updateTrainerFeatureVideoForm = this.formBuilder.group({
      id: this.trainerFeatureVideo?.id,
      motivation: [this.trainerFeatureVideo.motivation, Validators.compose([Validators.required, Validators.minLength(500)])],
      video: [Validators.required]
    });

  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerFeatureVideo().subscribe(trainerFeatureVideo => {
        this.trainerFeatureVideo = trainerFeatureVideo;
        this.trainerStateService.setMyTrainerFeatureVideoSubject(trainerFeatureVideo);
      })
    );
  }

  onVidSelected(event: any): void {
   this.selectedVideo = event.target.files[0];
  }

  onCurrentVideoSelected(event: any) {
    if (event.target.checked) {
      const base64Data = this.trainerFeatureVideo.video;
      if (base64Data) {
        const byteCharacters = atob(base64Data); // Decode base64 data
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'video/mp4' });
        const file = new File([blob], 'video.mp4', { type: 'video/mp4' }); // Create a File object
        this.selectedVideo = file;
        this.updateTrainerFeatureVideoForm.get('video')?.setErrors(null);
        this.isChecked = true
      }
    } else {
      this.updateTrainerFeatureVideoForm.get('video')?.setValue(null);
    }
  }

  updateFormValues(trainerFeatureVideo: TrainerFeatureVideo) {
    this.updateTrainerFeatureVideoForm.patchValue({
      id: trainerFeatureVideo.id,
      motivation: trainerFeatureVideo.motivation,
      video: trainerFeatureVideo.video,
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  checkTrainerFeatureVideoExists(): Observable<boolean> {
    return this.trainerStateService.getMyTrainerFeatureVideo().pipe(
      map((trainerFeatureVideo: TrainerFeatureVideo) => {
        return !!trainerFeatureVideo;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  updateTrainerFeatureVideo(): void {
    if (this.updateTrainerFeatureVideoForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    const requestData = new FormData();
    requestData.append('motivation', this.updateTrainerFeatureVideoForm.get('motivation')?.value);
    requestData.append('video', this.selectedVideo);

    const trainerFeatureVideo = this.updateTrainerFeatureVideoForm.value;


    this.ngxService.start();
    if (this.trainerFeatureVideo.id) {
      console.log(this.trainerFeatureVideo.id)
      // Update existing trainer motivation
      requestData.append('id', this.trainerFeatureVideo.id.toString());
      requestData.append('trainerId', this.trainerFeatureVideo.trainer.id.toString());
      this.trainerService.updateTrainerFeatureVideo(requestData)
        .subscribe((response: any) => {
          this.updateTrainerFeatureVideoForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
          this.emitEvent.emit();
          this.updateFormValues(trainerFeatureVideo);
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
      // Add new trainer motivation
      this.trainerService.addTrainerFeatureVideo(requestData)
        .subscribe((response: any) => {
          this.updateTrainerFeatureVideoForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
          this.updateFormValues(trainerFeatureVideo);
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
    this.updateTrainerFeatureVideoForm.reset();
  }
}

