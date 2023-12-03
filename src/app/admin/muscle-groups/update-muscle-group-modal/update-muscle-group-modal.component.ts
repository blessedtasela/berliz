import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { BodyParts, MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { ExerciseStateService } from 'src/app/services/exercise-state.service';
import { MuscleGroupService } from 'src/app/services/muscle-group.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-muscle-group-modal',
  templateUrl: './update-muscle-group-modal.component.html',
  styleUrls: ['./update-muscle-group-modal.component.css']
})
export class UpdateMuscleGroupModalComponent implements OnInit {
  onUpdateMuscleGroupEmit = new EventEmitter()
  updateMuscleGroupForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  bodyParts: BodyParts[] = [];
  muscleGroupData: MuscleGroups;

  constructor(private formBuilder: FormBuilder,
    private muscleGroupService: MuscleGroupService,
    public dialogRef: MatDialogRef<UpdateMuscleGroupModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.bodyParts = this.muscleGroupService.getBodyParts();
    this.muscleGroupData = this.data.muscleGroupData;
  }

  ngOnInit(): void {
    this.updateMuscleGroupForm = this.formBuilder.group({
      'id': new FormControl(this.muscleGroupData.id, [Validators.required]),
      'name': new FormControl(this.muscleGroupData.name, [Validators.required, Validators.minLength(2)]),
      'description': new FormControl(this.muscleGroupData.description, [Validators.required, Validators.minLength(20)]),
      'bodyPart': new FormControl(this.muscleGroupData.bodyPart, [Validators.required, Validators.minLength(1)]),
    });
  }

  ngOnDestroy() {
  }

  updateMuscleGroup(): void {
    this.ngxService.start();
    if (this.updateMuscleGroupForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.muscleGroupService.updateMuscleGroup(this.updateMuscleGroupForm.value)
        .subscribe((response: any) => {
          this.onUpdateMuscleGroupEmit.emit();
          this.updateMuscleGroupForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('muscleGroup updated successfully');
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a muscleGroup');
  }

  clear() {
    this.updateMuscleGroupForm.reset();
  }


}



