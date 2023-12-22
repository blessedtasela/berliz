import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-trainer-modal',
  templateUrl: './update-trainer-modal.component.html',
  styleUrls: ['./update-trainer-modal.component.css']
})
export class UpdateTrainerModalComponent {
  onUpdateTrainerEmit = new EventEmitter();
  updateTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  trainer!: Trainers;
  selectedCategoriesId: any;
  user!: Users;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UpdateTrainerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private userStateService: UserStateService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private categoryStateService: CategoryStateService,
    private trainerService: TrainerService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.trainer = this.data.trainerData;
  }

  ngOnInit(): void {
    this.selectedCategoriesId = this.trainer.categorySet.map(category => category.id);
    this.updateTrainerForm = this.formBuilder.group({
      'id': this.trainer?.id,
      'name': new FormControl(this.trainer.name, Validators.compose([Validators.required, Validators.minLength(3)])),
      'motto': new FormControl(this.trainer.motto, Validators.compose([Validators.required, Validators.minLength(10)])),
      'address': new FormControl(this.trainer.address, Validators.compose([Validators.required, Validators.minLength(10)])),
      'experience': new FormControl(this.trainer.experience, Validators.compose([Validators.required, Validators.minLength(1)])),
      'likes': new FormControl(this.trainer.likes, Validators.compose([Validators.required, Validators.minLength(1)])),
      'categoryIds': this.formBuilder.array(this.selectedCategoriesId, this.validateCheckbox()),
    });

    this.handleEmitEvent();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      this.categories = activeCategories;
    });
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    })
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without completing trainer aplication')
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;

      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  onCheckboxChanged(event: any) {
    console.log('Checkbox changed:', event.target.checked, event.target.value);
    const categories = this.updateTrainerForm.get('categoryIds') as FormArray;

    if (event.target.checked) {
      categories.push(new FormControl(event.target.value));
    } else {
      // Remove the control by its value
      const index = categories.controls.findIndex((control) => control.value === event.target.value);
      categories.removeAt(index);
    }
  }

  updateTrainer(): void {
    const selectedCategoryIds = this.updateTrainerForm.value.categoryIds;
    const categoryToStrings = selectedCategoryIds.join(',');
    const formData = {
      ...this.updateTrainerForm.value,
      categoryIds: categoryToStrings
    };
    if (this.updateTrainerForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.trainerService.updateTrainer(formData)
        .subscribe((response: any) => {
          this.updateTrainerForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Trainer account added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onUpdateTrainerEmit.emit();
        }, (error: any) => {
          this.ngxService.start();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        })
    }
  }

  clear() {
    this.updateTrainerForm.reset();
  }

}
