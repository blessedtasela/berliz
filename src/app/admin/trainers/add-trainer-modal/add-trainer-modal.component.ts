import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Partner } from 'src/app/models/partners.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { loadActivePartners } from 'src/app/state/partner/partner.actions';
import { selectActivePartners } from 'src/app/state/partner/partner.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-add-trainer-modal',
  templateUrl: './add-trainer-modal.component.html',
  styleUrls: ['./add-trainer-modal.component.css']
})
export class AddTrainerModalComponent {
  onAddTrainerEmit = new EventEmitter();
  addTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  activePartners: Partner[] = [];
  displayPhoto: any = "../../../assets/icons/user.png";
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  showCropper: boolean = false;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddTrainerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private trainerService: TrainerService,
    private store: Store) { }


  ngOnInit(): void {
    this.addTrainerForm = this.formBuilder.group({
      'id': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'motto': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'address': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'experience': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'photo': ['', Validators.compose([Validators.required, fileValidator])],
      'categoryIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.onEmit();
  }


  onEmit(): void {
    this.store.dispatch(loadActiveCategories());
    this.store.select(selectActiveCategories).subscribe((activeCategories) => {
      this.categories = activeCategories;
    });
    this.store.dispatch(loadActivePartners());
    this.store.select(selectActivePartners).subscribe((activePartners) => {
      this.activePartners = activePartners;
    });
  }


  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }


  closeDialog() {
    this.dialogRef.close('Dialog closed without completing trainer aplication')
  }

  onPhotoSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImageBlob = event.blob || null;
  }

  loadImageFailed(): void {
    this.snackBarService.openSnackBar('Failed to load image', 'error');
    this.showCropper = false;
    this.imageChangedEvent = null;
  }

  cancelCrop(): void {
    if (this.imageChangedEvent?.target) {
      this.imageChangedEvent.target.value = '';
    }
    this.addTrainerForm.patchValue({ photo: '' });
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

  confirmCrop(): void {
    if (!this.croppedImageBlob) {
      this.snackBarService.openSnackBar('Please crop the image first', 'error');
      return;
    }

    const file = new File([this.croppedImageBlob], `trainer_${Date.now()}.jpeg`, {
      type: this.croppedImageBlob.type || 'image/jpeg'
    });

    this.selectedPhoto = file;
    this.displayPhoto = URL.createObjectURL(file);

    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
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
    requestData.append('partnerId', this.addTrainerForm.get('id')?.value);
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
    this.selectedPhoto = null;
    this.displayPhoto = "../../../assets/icons/user.png";
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }
}
