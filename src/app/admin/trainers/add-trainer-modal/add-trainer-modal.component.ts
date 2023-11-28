import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Partners } from 'src/app/models/partners.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

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
  activePartners: Partners[] = [];
  displayPhoto: any = "../../../assets/icons/user.png";

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddTrainerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private categoryStateService: CategoryStateService,
    private trainerService: TrainerService,
    private partnerStateService: PartnerStateService) { }


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
    this.categoryStateService.allCategoriesData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.categories = cachedData;
      }
    });
    this.partnerStateService.activePartnersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.activePartners = cachedData;
      }
    });
  }

  handleEmitEvent() {
    console.log('isCachedData false')
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      this.categories = activeCategories;
      this.categoryStateService.setActiveCategoriesSubject(activeCategories);
    });
    this.partnerStateService.getActivePartners().subscribe((activePartners) => {
      this.activePartners = activePartners;
      this.partnerStateService.setActivePartnerssSubject(activePartners);
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
  }
}
