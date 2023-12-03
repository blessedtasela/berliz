import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { BodyParts } from 'src/app/models/muscle-groups.interface';
import { ExerciseStateService } from 'src/app/services/exercise-state.service';
import { MuscleGroupService } from 'src/app/services/muscle-group.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-muscle-group-modal',
  templateUrl: './add-muscle-group-modal.component.html',
  styleUrls: ['./add-muscle-group-modal.component.css']
})
export class AddMuscleGroupModalComponent {
  onAddMuscleGroupEmit = new EventEmitter()
  addMuscleGroupForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  selectedImage: any;
  subscription = new Subscription;
  bodyParts: BodyParts[] = [];

  constructor(private formBuilder: FormBuilder,
    private muscleGroupService: MuscleGroupService,
    private exerciseStateService: ExerciseStateService,
    public dialogRef: MatDialogRef<AddMuscleGroupModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {
    this.bodyParts = this.muscleGroupService.getBodyParts();
  }

  ngOnInit(): void {
    this.addMuscleGroupForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'bodyPart': ['', [Validators.required, Validators.minLength(2)]],
      'image': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
    });
  }

  ngOnDestroy() {
  }

  onImgSelected(event: any): void {
    this.selectedImage = event.target.files[0];
  }

  addMuscleGroup(): void {
    this.ngxService.start();
    if (this.addMuscleGroupForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      const requestData = new FormData();
      requestData.append('name', this.addMuscleGroupForm.get('name')?.value);
      requestData.append('bodyPart', this.addMuscleGroupForm.get('bodyPart')?.value);
      requestData.append('description', this.addMuscleGroupForm.get('description')?.value);
      requestData.append('image', this.selectedImage);
      this.muscleGroupService.addMuscleGroup(requestData)
        .subscribe((response: any) => {
          this.onAddMuscleGroupEmit.emit();
          this.addMuscleGroupForm.reset();
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
    this.addMuscleGroupForm.reset();
  }


}


