import { ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, forkJoin, take } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { AddMuscleGroupModalComponent } from '../../muscle-groups/add-muscle-group-modal/add-muscle-group-modal.component';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { ExerciseService } from 'src/app/services/exercise.service';
import { MuscleGroupStateService } from 'src/app/services/muscle-group-state.service';

@Component({
  selector: 'app-add-exercises-modal',
  templateUrl: './add-exercises-modal.component.html',
  styleUrls: ['./add-exercises-modal.component.css']
})
export class AddExercisesModalComponent implements OnInit{
  onAddExerciseEmit = new EventEmitter()
  addExerciseForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  muscleGroups!: MuscleGroups[];
  selectedDemo: any;
  subscriptions: Subscription[] = [];
  categories: Categories[] = [];

  constructor(private formBuilder: FormBuilder,
    private muscleGroupStateService: MuscleGroupStateService,
    private categoryStateService: CategoryStateService,
    private exerciseService: ExerciseService,
    public dialogRef: MatDialogRef<AddMuscleGroupModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
      this.addExerciseForm = this.formBuilder.group({
        'name': ['', [Validators.required, Validators.minLength(2)]],
        'demo': ['', [Validators.required, fileValidator]],
        'description': ['', [Validators.required, Validators.minLength(20)]],
        'categoryIds': this.formBuilder.array([], this.validateCheckbox()),
        'muscleGroupIds': this.formBuilder.array([], this.validateCheckbox()),
      });
      forkJoin([
        this.muscleGroupStateService.activeMuscleGroupsData$.pipe(take(1)),
        this.categoryStateService.activeCategoriesData$.pipe(take(1))
      ]).subscribe(([muscleGroupsData, categoriesData]) => {
        if (muscleGroupsData === null) {
          this.handleEmitEvent();
        } else {
          this.muscleGroups = muscleGroupsData;
        }
        if (categoriesData === null) {
          this.handleEmitEvent();
        } else {
          this.categories = categoriesData;
        }
      });
    }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscriptions.push(
      this.muscleGroupStateService.getActiveMuscleGroups().subscribe((muscleGroups) => {
        this.ngxService.start();
        this.muscleGroups = muscleGroups;
        this.muscleGroupStateService.setActiveMuscleGroupsSubject(muscleGroups);
        this.ngxService.stop();
      }),
      this.categoryStateService.getActiveCategories().subscribe((categories) => {
        this.ngxService.start();
        this.categories = categories;
        this.categoryStateService.setActiveCategoriesSubject(categories);
        this.ngxService.stop();
      }),
    );
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      try {
        const checkboxes = formArray.value;
        const isChecked = checkboxes.length > 0;
        return isChecked ? null : { noCheckboxChecked: { message: 'At least one checkbox must be checked.' } };
      } catch (error) {
        console.error('Error in checkbox validation:', error);
        return { validationError: { message: 'An error occurred during validation.' } };
      }
    };
  }


  onVideoSelected(event: any): void {
    this.selectedDemo = event.target.files[0];
  }

  onMuscleGroupCheckboxChanged(event: any) {
    const muscleGroups = this.addExerciseForm.get('muscleGroupIds') as FormArray;
    if (event.target.checked) {
      muscleGroups.push(this.formBuilder.group({ muscleGroupIds: event.target.value }));
    } else {
      const index = muscleGroups.controls.findIndex((control) => control.value.muscleGroupIds === event.target.value);
      muscleGroups.removeAt(index);
    }
  }

  onCategoryCheckboxChanged(event: any) {
    const categories = this.addExerciseForm.get('categoryIds') as FormArray;
    if (event.target.checked) {
      categories.push(this.formBuilder.group({ categoryIds: event.target.value }));
    } else {
      const index = categories.controls.findIndex((control) => control.value.categoryIds === event.target.value);
      categories.removeAt(index);
    }
  }

  addExercise(): void {
    this.ngxService.start();
    if (this.addExerciseForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      const selectedMuscleGroupIds = this.addExerciseForm.value.muscleGroupIds.map((muscleGroup: any) => muscleGroup.muscleGroupIds);
      const selectedCategoryIds = this.addExerciseForm.value.categoryIds.map((category: any) => category.categoryIds);
      const muscleGroupIdsString = selectedMuscleGroupIds.join(',');
      const categoryIdsString = selectedCategoryIds.join(',');
      const requestData = new FormData();
      requestData.append('name', this.addExerciseForm.get('name')?.value);
      requestData.append('categories', categoryIdsString);
      requestData.append('description', this.addExerciseForm.get('description')?.value);
      requestData.append('demo', this.selectedDemo);
      requestData.append('muscleGroups', muscleGroupIdsString);
      this.exerciseService.addExercise(requestData)
        .subscribe((response: any) => {
          this.onAddExerciseEmit.emit();
          this.addExerciseForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('exercise added successfully');
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
    this.dialogRef.close('Dialog closed without adding a exercise');
  }

  clear() {
    this.addExerciseForm.reset();
  }


}



