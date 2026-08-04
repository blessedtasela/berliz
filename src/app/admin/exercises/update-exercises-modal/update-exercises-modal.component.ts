import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Exercises } from 'src/app/models/exercise.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { ExerciseService } from 'src/app/services/exercise.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { loadActiveMuscleGroups } from 'src/app/state/muscle-group/muscle-group.actions';
import { selectActiveMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';

@Component({
  selector: 'app-update-exercises-modal',
  templateUrl: './update-exercises-modal.component.html',
  styleUrls: ['./update-exercises-modal.component.css']
})
export class UpdateExercisesModalComponent {
  onUpdateExerciseEmit = new EventEmitter()
  updateExerciseForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  muscleGroups: MuscleGroups[] = [];
  categories: Categories[] = [];
  subscriptions: Subscription[] = [];
  exerciseData: Exercises;
  selectedMuscleGroupIds: any;
  selectedCategoryIds: any;

  constructor(private formBuilder: FormBuilder,
    private exerciseService: ExerciseService,
    private store: Store,
    public dialogRef: MatDialogRef<UpdateExercisesModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.exerciseData = this.data.exerciseData;
  }

  ngOnInit(): void {
    if (this.exerciseData && this.exerciseData.muscleGroups && this.exerciseData.categories) {
      this.selectedCategoryIds = this.exerciseData.categories.map(category => category.id);
      this.selectedMuscleGroupIds = this.exerciseData.muscleGroups.map(muscleGroup => muscleGroup.id);
      this.updateExerciseForm = this.formBuilder.group({
        'id': new FormControl(this.exerciseData.id, [Validators.required]),
        'name': new FormControl(this.exerciseData.name, [Validators.required, Validators.minLength(2)]),
        'description': new FormControl(this.exerciseData.description, [Validators.required, Validators.minLength(20)]),
        'categoryIds': this.formBuilder.array(this.selectedCategoryIds, this.validateCheckbox()),
        'muscleGroupIds': this.formBuilder.array(this.selectedMuscleGroupIds, this.validateCheckbox()),
      });
    } else {
      console.error('Exercisedata or muscleGroup and category data is null or undefined.');
      this.updateExerciseForm = this.formBuilder.group({
        'id': new FormControl(this.exerciseData.id, [Validators.required]),
        'name': new FormControl(this.exerciseData.name, [Validators.required, Validators.minLength(2)]),
        'description': new FormControl(this.exerciseData.description, [Validators.required, Validators.minLength(20)]),
      });
    }
    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.store.dispatch(loadActiveMuscleGroups());
    this.store.dispatch(loadActiveCategories());
    this.subscriptions.push(
      this.store.select(selectActiveMuscleGroups).subscribe((muscleGroups) => {
        this.muscleGroups = muscleGroups;
        this.ngxService.stop();
      }),
      this.store.select(selectActiveCategories).subscribe((categories) => {
        this.categories = categories;
        this.ngxService.stop();
      }),
    );
  }

  onMuscleGroupCheckboxChanged(event: any) {
    const muscleGroups = this.updateExerciseForm.get('muscleGroupIds') as FormArray;
    if (event.target.checked) {
      muscleGroups.push(new FormControl(event.target.value));
    } else {
      const index = muscleGroups.controls.findIndex((control) => control.value === event.target.value);
      muscleGroups.removeAt(index);
    }
  }

  onCategoryCheckboxChanged(event: any) {
    const categories = this.updateExerciseForm.get('categoryIds') as FormArray;
    if (event.target.checked) {
      categories.push(new FormControl(event.target.value));
    } else {
      const index = categories.controls.findIndex((control) => control.value === event.target.value);
      categories.removeAt(index);
    }
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;
      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  updateExercise(): void {
    this.ngxService.start();
    if (this.updateExerciseForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      var formData;
      if (this.exerciseData && this.exerciseData.muscleGroups && this.exerciseData.categories) {
        const selectedMuscleGroupIds = this.updateExerciseForm.value.muscleGroupIds;
        const selectedCategoryIds = this.updateExerciseForm.value.categoryIds;
        const muscleGroupIdsString = selectedMuscleGroupIds.join(',');
        const categoryIdsString = selectedCategoryIds.join(',');
        formData = {
          ...this.updateExerciseForm.value,
          muscleGroupIds: muscleGroupIdsString,
          categoryIds: categoryIdsString
        };
      } else {
        formData = this.updateExerciseForm.value;
      }
      this.exerciseService.updateExercise(formData)
        .subscribe((response: any) => {
          this.onUpdateExerciseEmit.emit();
          this.updateExerciseForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Exercise Updated successfully');
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
    this.dialogRef.close('Dialog closed without updating exercise');
  }

  clear() {
    this.updateExerciseForm.reset();
  }


}




