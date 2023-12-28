import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, forkJoin, take } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { ClientService } from 'src/app/services/client.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { genericError } from 'src/validators/form-validators.module';
import { AddClientModalComponent } from '../add-client-modal/add-client-modal.component';
import { Users } from 'src/app/models/users.interface';
import { Clients } from 'src/app/models/clients.interface';

@Component({
  selector: 'app-update-client-modal',
  templateUrl: './update-client-modal.component.html',
  styleUrls: ['./update-client-modal.component.css']
})
export class UpdateClientModalComponent {
  onUpdateClientEmit = new EventEmitter()
  updateClientForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  categories: Categories[] = [];
  client!: Clients;
  selectedCategoriesId: any;
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private categoryStateService: CategoryStateService,
    private subscriptionStateService: SubscriptionStateService,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<AddClientModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.client = this.data.clientData;
  }


  ngOnInit(): void {
    this.selectedCategoriesId = this.client.categories.map(category => category.id);
    this.updateClientForm = this.formBuilder.group({
      'id': this.client?.id,
      'height': new FormControl(this.client.height, [Validators.required, Validators.minLength(2)]),
      'weight': new FormControl(this.client.weight, [Validators.required, Validators.minLength(2)]),
      'medicalConditions': new FormControl(this.client.medicalConditions, [Validators.required, Validators.minLength(2)]),
      'dietaryPreferences': new FormControl(this.client.dietaryPreferences, [Validators.required, Validators.minLength(2)]),
      'dietaryRestrictions': new FormControl(this.client.dietaryRestrictions, [Validators.required, Validators.minLength(2)]),
      'caloriesIntake': new FormControl(this.client.caloriesIntake, [Validators.required, Validators.minLength(2)]),
      'categoryIds': this.formBuilder.array(this.selectedCategoriesId, this.validateCheckbox()),
      'mode': new FormControl(this.client.mode, [Validators.required, Validators.minLength(2)]),
      'motivation': new FormControl(this.client.motivation, [Validators.required, Validators.minLength(15)]),
      'targetWeight': new FormControl(this.client.targetWeight, [Validators.required, Validators.minLength(2)]),
    });
    forkJoin([
      this.categoryStateService.activeCategoriesData$.pipe(take(1)),
    ]).subscribe(([categories]) => {
      if (categories === null) {
        this.handleEmitEvent();
      } else {
        this.categories = categories;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriptions) => {
      subscriptions.unsubscribe()
    })
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscriptions.push(
      this.categoryStateService.getActiveCategories().subscribe((categories) => {
        this.ngxService.start();
        this.categories = categories;
        this.categoryStateService.setActiveCategoriesSubject(categories);
        this.cd.detectChanges();
        this.ngxService.stop();
      })
    );
  }


  onCheckboxChanged(event: any) {
    const categories = this.updateClientForm.get('categoryIds') as FormArray;
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

  addCategory(): void {
    this.ngxService.start();
    if (this.updateClientForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      const selectedCategoryIds = this.updateClientForm.value.categoryIds;
      const categoryIdsString = selectedCategoryIds.join(',');
      const formData = {
        ...this.updateClientForm.value,
        categoryIds: categoryIdsString
      };
      this.clientService.updateClient(formData)
        .subscribe((response: any) => {
          this.onUpdateClientEmit.emit();
          this.updateClientForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Category updated successfully');
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
    this.dialogRef.close('Dialog closed without adding a category');
  }

  clear() {
    this.updateClientForm.reset();
    this.onCheckboxChanged(event)
  }


}


