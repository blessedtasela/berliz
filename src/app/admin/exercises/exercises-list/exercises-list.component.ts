import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { ExerciseService } from 'src/app/services/exercise.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { Store } from '@ngrx/store';
import { loadExercises } from 'src/app/state/exercise/exercise.actions';
import { selectExercises } from 'src/app/state/exercise/exercise.selectors';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { MuscleGroupDetailsModalComponent } from '../../muscle-groups/muscle-group-details-modal/muscle-group-details-modal.component';
import { UpdateMuscleGroupModalComponent } from '../../muscle-groups/update-muscle-group-modal/update-muscle-group-modal.component';
import { UpdateExercisesModalComponent } from '../update-exercises-modal/update-exercises-modal.component';
import { ExercisesDetailsModalComponent } from '../exercises-details-modal/exercises-details-modal.component';

@Component({
  selector: 'app-exercises-list',
  templateUrl: './exercises-list.component.html',
  styleUrls: ['./exercises-list.component.css']
})
export class ExercisesListComponent implements OnDestroy {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() exercisesData: Exercises[] = [];
  @Input() totalExercises: number = 0;
  selectedDemo: any;

  private subscriptions: Subscription[] = [];

  uploadingVideoFor: number | null = null;

  constructor(private datePipe: DatePipe,
    private exerciseService: ExerciseService,
    private strapiService: StrapiService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    private store: Store,
    private router: Router) {
  }

  ngOnInit() {
    this.watchUpdateExercise()
    this.watchUpdateStatus()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadExercises());
    this.store.select(selectExercises).subscribe((allExercises) => {
      this.exercisesData = allExercises;
      this.totalExercises = this.exercisesData.length
    });
  }


  openUpdateExercise(id: number) {
    try {
      const exercise = this.exercisesData.find(exercise => exercise.id === id);
      if (exercise) {
        const dialogRef = this.dialog.open(UpdateExercisesModalComponent, {
          width: '720px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: true,
          data: {
            exerciseData: exercise,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateExercisesModalComponent;
        childComponentInstance.onUpdateExerciseEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a exercise');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('exercise not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check exercise status", 'error');
    }
  }

  openExerciseDetails(id: number) {
    this.router.navigate(['/dashboard/hub/exercises', id]);
  }

  updateExerciseStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const exercise = this.exercisesData.find(exercise => exercise.id === id);
    const message = exercise?.status === 'false'
      ? 'activate this exercise?'
      : 'deactivate this exercise?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.exerciseService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('exercise status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating exercise status');
            }
          });
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  deleteExercise(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this exercise? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.exerciseService.deleteExercise(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('exercise deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting exercise');
            }
          });
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  /** The small still image (validated server-side as an image, not a video — see updateDemo). */
  onDemoImageSelected(event: any, id: number): void {
    const selectedDemo = event.target.files[0];
    if (selectedDemo) {
      this.selectedDemo = selectedDemo;
      this.updateDemo(id);
    }
  }

  /** The real demo video — uploaded to Strapi first, then attached via updateExerciseVideo. */
  onDemoVideoSelected(event: any, id: number): void {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    this.uploadingVideoFor = id;
    this.ngxService.start();
    this.strapiService.uploadToStrapi(file).pipe(take(1)).subscribe({
      next: (res) => {
        const uploaded = res?.[0];
        if (!uploaded?.url) {
          this.uploadingVideoFor = null;
          this.ngxService.stop();
          this.snackbarService.openSnackBar('Upload failed — no file returned', 'error');
          return;
        }
        this.exerciseService.updateExerciseVideo(id, {
          strapiId: uploaded.id,
          name: uploaded.name,
          videoUrl: uploaded.url,
          mimeType: uploaded.mime,
          byteSize: uploaded.size,
        }).subscribe({
          next: (response: any) => {
            this.uploadingVideoFor = null;
            this.ngxService.stop();
            this.snackbarService.openSnackBar(response?.message || 'Video updated', '');
            this.handleEmitEvent();
          },
          error: (err: any) => {
            this.uploadingVideoFor = null;
            this.ngxService.stop();
            this.snackbarService.openSnackBar(err?.error?.message || genericError, 'error');
          }
        });
      },
      error: (err: any) => {
        this.uploadingVideoFor = null;
        this.ngxService.stop();
        this.snackbarService.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }

  updateDemo(id: number): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('file', this.selectedDemo);
    requestData.append('id', id.toString());
    this.exerciseService.updateExerciseDemo(requestData)
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

  watchUpdateExercise() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updateExercise').subscribe((message) => {
        const receivedExercises: Exercises = JSON.parse(message.body);
        const exerciseId = this.exercisesData.findIndex(exercise => exercise.id === receivedExercises.id)
        this.exercisesData[exerciseId] = receivedExercises
      })
    );
  }

  watchUpdateStatus() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updateExerciseStatus').subscribe((message) => {
        const receivedExercises: Exercises = JSON.parse(message.body);
        const exerciseId = this.exercisesData.findIndex(exercise => exercise.id === receivedExercises.id)
        this.exercisesData[exerciseId] = receivedExercises
      })
    );
  }

}

