import { ChangeDetectorRef, Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { genericError } from 'src/validators/form-validators.module';
import { CategoryService } from 'src/app/services/category.service';
import { Icons } from 'src/app/models/categories.interface';
import { Tags } from 'src/app/models/tags.interface';
import { Observable, tap, catchError, of, Subscription } from 'rxjs';
import { TagStateService } from 'src/app/services/tag-state.service';

@Component({
  selector: 'app-add-category-modal',
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.css']
})
export class AddCategoryModalComponent implements OnInit {
  onAddCategoryEmit = new EventEmitter();
  addCategoryForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  icons: Icons[];
  tags!: Tags[];
  selectedIcon: string = '../../../../../assets/icons/gym';
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private tagStateService: TagStateService,
    public dialogRef: MatDialogRef<AddCategoryModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {
    this.icons = categoryService.getIcons();
  }

  ngOnInit(): void {
    this.addCategoryForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'photo': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.tagStateService.activeTagsData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent();
      } else {
        this.tags = cachedData
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscription.add(
      this.tagStateService.getActiveTags().subscribe((tags) => {
        this.ngxService.start();
        this.tags = tags;
        this.tagStateService.setActiveTagsSubject(tags);
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      })
    );
  }


  onCheckboxChanged(event: any) {
    const tags = this.addCategoryForm.get('tagIds') as FormArray;
    if (event.target.checked) {
      tags.push(this.formBuilder.group({ tagIds: event.target.value }));
    } else {
      const index = tags.controls.findIndex((control) => control.value.tagIds === event.target.value);
      tags.removeAt(index);
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
    if (this.addCategoryForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addCategoryForm.value.tagIds.map((tag: any) => tag.tagIds);

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addCategoryForm.value,
        tagIds: tagIdsString
      };
      this.categoryService.addCategory(formData)
        .subscribe((response: any) => {
          this.onAddCategoryEmit.emit();
          this.addCategoryForm.reset();
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
    this.addCategoryForm.reset();
    this.selectedIcon = '../../../../../assets/icons/gym';
    this.onCheckboxChanged(event)
  }


}

