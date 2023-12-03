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
  exercises!: Exercises[];
  selectedImage: any;
  subscription = new Subscription;
  bodyParts: BodyParts[] = [];
  muscleGroupData: MuscleGroups;
  selectedExerciseId: any;

  constructor(private formBuilder: FormBuilder,
    private muscleGroupService: MuscleGroupService,
    private exerciseStateService: ExerciseStateService,
    public dialogRef: MatDialogRef<UpdateMuscleGroupModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.bodyParts = this.muscleGroupService.getBodyParts();
    this.muscleGroupData = this.data.muscleGroupData;
  }

  ngOnInit(): void {
    if (this.muscleGroupData && this.muscleGroupData.exercise) {
      this.selectedExerciseId = this.muscleGroupData.exercise.map(exercise => exercise.id);
      this.updateMuscleGroupForm = this.formBuilder.group({
        'id': new FormControl(this.muscleGroupData.id, [Validators.required]),
        'name': new FormControl(this.muscleGroupData.name, [Validators.required, Validators.minLength(2)]),
        'description': new FormControl(this.muscleGroupData.description, [Validators.required, Validators.minLength(20)]),
        'bodyPart': new FormControl(this.muscleGroupData.bodyPart, [Validators.required, Validators.minLength(1)]),
        'exerciseIds': this.formBuilder.array(this.selectedExerciseId, this.validateCheckbox()),
      });
    } else {
      console.error('Muscle group data or exercise data is null or undefined.');
      this.updateMuscleGroupForm = this.formBuilder.group({
        'id': new FormControl(this.muscleGroupData.id, [Validators.required]),
        'name': new FormControl(this.muscleGroupData.name, [Validators.required, Validators.minLength(2)]),
        'description': new FormControl(this.muscleGroupData.description, [Validators.required, Validators.minLength(20)]),
        'bodyPart': new FormControl(this.muscleGroupData.bodyPart, [Validators.required, Validators.minLength(1)]),
      });
    }
    this.exerciseStateService.activeExercisesData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.exercises = cachedData
      } else {
        this.handleEmitEvent();
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscription.add(
      this.exerciseStateService.getActiveExercises().subscribe((exercises) => {
        this.ngxService.start();
        this.exercises = exercises;
        this.exerciseStateService.setActiveExercisesSubject(exercises);
        this.ngxService.stop();
      })
    );
  }

  onCheckboxChanged(event: any) {
    const exercises = this.updateMuscleGroupForm.get('exerciseIds') as FormArray;
    if (event.target.checked) {
      exercises.push(this.formBuilder.group({ exerciseIds: event.target.value }));
    } else {
      const index = exercises.controls.findIndex((control) => control.value.exerciseIds === event.target.value);
      exercises.removeAt(index);
    }
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;
      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  addCategory(): void {
    this.ngxService.start();
    if (this.updateMuscleGroupForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      var formData;
      if (this.muscleGroupData && this.muscleGroupData.exercise) {
        const selectedExerciseIds = this.updateMuscleGroupForm.value.exerciseIds.map((exercise: any) => exercise.exerciseIds);
        const tagIdsString = selectedExerciseIds.join(',');
        formData = {
          ...this.updateMuscleGroupForm.value,
          tagIds: tagIdsString
        };
      } else {
        formData = this.updateMuscleGroupForm.value;
      }
      this.muscleGroupService.updateMuscleGroup(formData)
        .subscribe((response: any) => {
          this.onUpdateMuscleGroupEmit.emit();
          this.updateMuscleGroupForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('muscleGroup added successfully');
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



