import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Exercises } from 'src/app/models/exercise.interface';
import { ExerciseStateService } from 'src/app/services/exercise-state.service';
import { ExerciseService } from 'src/app/services/exercise.service';
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
export class ExercisesListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() exercisesData: Exercises[] = [];
  @Input() totalExercises: number = 0;
  selectedDemo: any;

  constructor(private datePipe: DatePipe,
    private exerciseService: ExerciseService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public exerciseStateService: ExerciseStateService) {
  }

  ngOnInit() {
    this.watchUpdateExercise()
    this.watchUpdateStatus()
  }

  handleEmitEvent() {
    this.exerciseStateService.getExercises().subscribe((allExercises) => {
      this.ngxService.start()
      this.exercisesData = allExercises;
      this.totalExercises = this.exercisesData.length
      this.exerciseStateService.setAllExercisesSubject(this.exercisesData);
      this.ngxService.stop()
    });
  }


  openUpdateExercise(id: number) {
    try {
      const exercise = this.exercisesData.find(exercise => exercise.id === id);
      if (exercise) {
        const dialogRef = this.dialog.open(UpdateExercisesModalComponent, {
          width: '900px',
          maxHeight: '600px',
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
    try {
      const exercise = this.exercisesData.find(exercise => exercise.id === id);
      if (exercise) {
        const dialogRef = this.dialog.open(ExercisesDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            exerciseData: exercise,
          }
        });
      } else {
        this.snackbarService.openSnackBar('exercise not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check exercise status", 'error');
    }
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

  onVideoSelected(event: any, id: number): void {
    const selectedDemo = event.target.files[0];
    if (selectedDemo) {
      this.selectedDemo = selectedDemo;
      this.updateDemo(id);
    }
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
    this.rxStompService.watch('/topic/updateExercise').subscribe((message) => {
      const receivedExercises: Exercises = JSON.parse(message.body);
      const exerciseId = this.exercisesData.findIndex(exercise => exercise.id === receivedExercises.id)
      this.exercisesData[exerciseId] = receivedExercises
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateExerciseStatus').subscribe((message) => {
      const receivedExercises: Exercises = JSON.parse(message.body);
      const exerciseId = this.exercisesData.findIndex(exercise => exercise.id === receivedExercises.id)
      this.exercisesData[exerciseId] = receivedExercises
    });
  }

}

