import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-data',
  templateUrl: './trainer-data.component.html',
  styleUrls: ['./trainer-data.component.css']
})
export class TrainerDataComponent {
  @Output() emitEvent = new EventEmitter();
  updateTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  @Input() trainer!: Trainers;
  selectedCategoriesId: any;
  user!: Users;
  subscriptions: Subscription[] = [];
  originalValue: any;

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private userStateService: UserStateService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private categoryStateService: CategoryStateService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.handleEmitEvent();
    this.user = this.user || { role: null };
    this.selectedCategoriesId = this.trainer.categories.map(category => category.id);
    this.updateTrainerForm = this.formBuilder.group({
      'id': this.trainer?.id,
      'name': [this.trainer.name, Validators.compose([Validators.required, Validators.minLength(3)])],
      'motto': [this.trainer.motto, Validators.compose([Validators.required, Validators.minLength(10)])],
      'address': [this.trainer.address, Validators.compose([Validators.required, Validators.minLength(10)])],
      'experience': [this.trainer.experience, Validators.compose([Validators.required, Validators.minLength(1)])],
      'likes': [this.trainer.likes, Validators.compose([Validators.required, Validators.minLength(1)])],
      'categoryIds': this.formBuilder.array(this.selectedCategoriesId, this.validateCheckbox()),
    });

    this.originalValue = this.updateTrainerForm.getRawValue();
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
        this.categories = activeCategories;
        this.categoryStateService.setActiveCategoriesSubject(activeCategories);
      }),
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user);
      }),
      this.trainerStateService.getTrainer().subscribe((trainer) => {
        this.trainer = trainer
        this.trainerStateService.setTrainerSubject(trainer);
      })
    );
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  updateFormValues(trainer: Trainers) {
    this.updateTrainerForm.patchValue({
      id: trainer.id,
      name: trainer.name,
      motto: trainer.motto,
      address: trainer.address,
      likes: trainer.likes,
      experience: trainer.experience,
      categoryIds: trainer.categories.map(category => category.id)
    });
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
    if (this.updateTrainerForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    this.invalidForm = false;

    const formValue = this.updateTrainerForm.value;

    const payload = {
      id: this.trainer.id,
      partnerId: this.trainer.partnerId,
      name: formValue.name,
      motto: formValue.motto,
      address: formValue.address,
      experience: formValue.experience,
      status: formValue.status,
      categoryIds: formValue.categoryIds,
      photoRequest: this.trainer.photoResponse
    };

    this.ngxService.start();
    this.trainerService.updateTrainer(payload).subscribe({
      next: (response: any) => {
        this.responseMessage = response?.message;
        this.snackBarService.openSnackBar(this.responseMessage, "");
        this.updateFormValues(response);
        this.originalValue = this.updateTrainerForm.getRawValue();
        this.trainer = response;
        this.emitEvent.emit();
        this.ngxService.stop();
      },

      error: (error: any) => {
        this.responseMessage = error.error?.message || genericError;
        this.snackBarService.openSnackBar(this.responseMessage, "error");
        this.ngxService.stop();
      }
    });
  }


  clear() {
    this.updateTrainerForm.reset();
  }

  hasChanges(): boolean {

    const current =
      JSON.stringify(
        this.updateTrainerForm.getRawValue()
      );

    const original =
      JSON.stringify(this.originalValue);

    return current !== original;
  }
}

