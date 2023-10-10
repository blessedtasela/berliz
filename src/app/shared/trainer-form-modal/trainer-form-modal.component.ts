import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Partners } from 'src/app/models/partners.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-form-modal',
  templateUrl: './trainer-form-modal.component.html',
  styleUrls: ['./trainer-form-modal.component.css']
})
export class TrainerFormModalComponent {
  onAddTrainerEmit = new EventEmitter();
  addTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  partner!: Partners;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TrainerFormModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private categoryStateService: CategoryStateService,
    private trainerService: TrainerService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.partner = this.data.partnerData;
  }

  ngOnInit(): void {
    this.addTrainerForm = this.formBuilder.group({
      'id': this.partner?.id,
      'name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'motto': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'address': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'experience': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'photo': ['', Validators.compose([Validators.required, fileValidator])],
      'categoryIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      this.categories = activeCategories;
      this.cdr.detectChanges();
    });
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without completing trainer aplication')
  }

  onPhotoSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedPhoto = event.target.files[0];
    }
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;

      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  onCheckboxChanged(event: any) {
    const categories = this.addTrainerForm.get('categoryIds') as FormArray;

    if (event.target.checked) {
      categories.push(this.formBuilder.group({ categoryIds: event.target.value }));
    } else {
      // Remove the control by its value
      const index = categories.controls.findIndex((control) => control.value.tagIds === event.target.value);
      categories.removeAt(index);
    }
  }

  addTrainer(): void {
    const selectedCategoryIds = this.addTrainerForm.value.categoryIds.map((categories: any) => categories.categoryIds);
    const categoryToStrings = selectedCategoryIds.join(',');

    const requestData = new FormData();
    requestData.append('id', this.addTrainerForm.get('id')?.value);
    requestData.append('name', this.addTrainerForm.get('name')?.value);
    requestData.append('motto', this.addTrainerForm.get('motto')?.value);
    requestData.append('address', this.addTrainerForm.get('address')?.value);
    requestData.append('experience', this.addTrainerForm.get('experience')?.value);
    requestData.append('photo', this.selectedPhoto);
    requestData.append('categoryIds', categoryToStrings);

    if (this.addTrainerForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.trainerService.addTrainer(requestData)
        .subscribe((response: any) => {
          this.addTrainerForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Trainer account added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onAddTrainerEmit.emit();
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
    this.addTrainerForm.reset();
  }
}
