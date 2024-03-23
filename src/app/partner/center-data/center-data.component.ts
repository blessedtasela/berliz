import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { Users } from 'src/app/models/users.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CenterStateService } from 'src/app/services/center-state.service';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-data',
  templateUrl: './center-data.component.html',
  styleUrls: ['./center-data.component.css']
})
export class CenterDataComponent {
  @Output() emitEvent = new EventEmitter();
  updateCenterForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  @Input() center!: Centers;
  selectedCategoriesId: any;
  user!: Users;
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private userStateService: UserStateService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private categoryStateService: CategoryStateService,
    private centerService: CenterService,
    private centerStateService: CenterStateService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.selectedCategoriesId = this.center.categorySet.map(category => category.id);
    this.updateCenterForm = this.formBuilder.group({
      'id': this.center?.id,
      'name': new FormControl(this.center.name, Validators.compose([Validators.required, Validators.minLength(3)])),
      'motto': new FormControl(this.center.motto, Validators.compose([Validators.required, Validators.minLength(10)])),
      'address': new FormControl(this.center.address, Validators.compose([Validators.required, Validators.minLength(10)])),
      'location': new FormControl(this.center.address, Validators.compose([Validators.required, Validators.minLength(10)])),
      'experience': new FormControl(this.center.experience, Validators.compose([Validators.required, Validators.minLength(1)])),
      'categoryIds': this.formBuilder.array(this.selectedCategoriesId, this.validateCheckbox()),
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.subscriptions.push(
      this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
        this.categories = activeCategories;
        this.categoryStateService.setActiveCategoriesSubject(activeCategories);
      }),
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user);
      }),
      this.centerStateService.getCenter().subscribe((center) => {
        this.center = center
        this.centerStateService.setCenterSubject(center);
      })
    );
    this.ngxService.stop()
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
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
    const categories = this.updateCenterForm.get('categoryIds') as FormArray;

    if (event.target.checked) {
      categories.push(new FormControl(event.target.value));
    } else {
      // Remove the control by its value
      const index = categories.controls.findIndex((control) => control.value === event.target.value);
      categories.removeAt(index);
    }
  }

  updatecenter(): void {
    const selectedCategoryIds = this.updateCenterForm.value.categoryIds;
    const categoryToStrings = selectedCategoryIds.join(',');
    const formData = {
      ...this.updateCenterForm.value,
      categoryIds: categoryToStrings
    };

    if (this.updateCenterForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.centerService.updateCenter(formData)
        .subscribe((response: any) => {
          this.updateCenterForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.emitEvent.emit();
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
    this.updateCenterForm.reset();
  }
}

