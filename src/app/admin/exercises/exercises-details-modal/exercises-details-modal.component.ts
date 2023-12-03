import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { ExerciseStateService } from 'src/app/services/exercise-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';

@Component({
  selector: 'app-exercises-details-modal',
  templateUrl: './exercises-details-modal.component.html',
  styleUrls: ['./exercises-details-modal.component.css']
})
export class ExercisesDetailsModalComponent {
  onEmit = new EventEmitter();
  exerciseData!: Exercises;
  responseMessage: any;
  subscriptions: Subscription[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ExercisesDetailsModalComponent>,
    private exerciseStateService: ExerciseStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe) {
    this.exerciseData = this.data.exerciseData;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()))
  }

  handleEmit() {
    this.ngxService.start();
    this.subscriptions.push(
      this.exerciseStateService.getExercises().subscribe((exercises) => {
        const muscleGroup = exercises.find(muscleGroup => muscleGroup.id == this.exerciseData.id);
        if (muscleGroup)
          this.exerciseData = muscleGroup
      }),
    );
    this.ngxService.stop();
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}
