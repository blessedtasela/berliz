import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin, take } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { Categories } from 'src/app/models/categories.interface';
import { Users } from 'src/app/models/users.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { ClientService } from 'src/app/services/client.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-client-modal',
  templateUrl: './add-client-modal.component.html',
  styleUrls: ['./add-client-modal.component.css']
})
export class AddClientModalComponent {
  onAddClientEmit = new EventEmitter();
  addClientForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  categories: Categories[] = [];
  users: Users[] = [];
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private categoryStateService: CategoryStateService,
    private userStateService: UserStateService,
    private subscriptionStateService: SubscriptionStateService,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<AddClientModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.addClientForm = this.formBuilder.group({
      'userId': ['', [Validators.required, Validators.minLength(1)]],
      'height': ['', [Validators.required, Validators.minLength(2)]],
      'weight': ['', [Validators.required, Validators.minLength(2)]],
      'medicalConditions': ['', [Validators.required, Validators.minLength(2)]],
      'dietaryPreferences': ['', [Validators.required, Validators.minLength(2)]],
      'dietaryRestrictions': ['', [Validators.required, Validators.minLength(2)]],
      'calorieIntake': ['', [Validators.required, Validators.minLength(2)]],
      'categoryIds': this.formBuilder.array([], this.validateCheckbox()),
      'mode': ['', [Validators.required, Validators.minLength(2)]],
      'motivation': ['', [Validators.required, Validators.minLength(15)]],
      'targetWeight': ['', [Validators.required, Validators.minLength(2)]],
    });
    forkJoin([
      this.categoryStateService.activeCategoriesData$.pipe(take(1)),
      this.userStateService.activeUserData$.pipe(take(1))
    ]).subscribe(([categories, users]) => {
      if (categories === null) {
        this.handleEmitEvent();
      } else {
        this.categories = categories;
      }
      if (users === null) {
        this.handleEmitEvent();
      } else {
        this.users = users;
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
    ),
    this.userStateService.getActiveUsers().subscribe((users) => {
      this.ngxService.start();
      this.users = users;
      this.userStateService.setActiveUsersSubject(users);
      this.cd.detectChanges(); 
      this.ngxService.stop();
    });
  }


  onCheckboxChanged(event: any) {
    const categories = this.addClientForm.get('categoryIds') as FormArray;
    if (event.target.checked) {
      categories.push(this.formBuilder.group(event.target.value));
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
    if (this.addClientForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      const selectedCategoryIds = this.addClientForm.value.categoryIds;
      const categoryIdsString = selectedCategoryIds.join(',');
      const formData = {
        ...this.addClientForm.value,
        categoryIds: categoryIdsString
      };
      this.clientService.addClient(formData)
        .subscribe((response: any) => {
          this.onAddClientEmit.emit();
          this.addClientForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Category added successfully');
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
    this.addClientForm.reset();
    this.onCheckboxChanged(event)
  }


}

