import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categories, Icons } from 'src/app/models/categories.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, tap, catchError, of } from 'rxjs';
import { Tags } from 'src/app/models/tags.interface';
import { CategoryService } from 'src/app/services/category.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { genericError } from 'src/validators/form-validators.module';
import { TagStateService } from 'src/app/services/tag-state.service';

@Component({
  selector: 'app-update-category-modal',
  templateUrl: './update-category-modal.component.html',
  styleUrls: ['./update-category-modal.component.css']
})
export class UpdateCategoryModalComponent {
  onUpdateCategoryEmit = new EventEmitter();
  updateCategoryForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  icons: Icons[];
  tags!: Tags[];
  categoryData!: Categories;
  selectedTagsId: any;

  constructor(private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private tagService: TagService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<UpdateCategoryModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tagStateService: TagStateService) {
    this.icons = categoryService.getIcons();
    this.categoryData = this.data.categoryData;
  }

  ngOnInit(): void {
    this.handleEmitEvent()
    this.selectedTagsId = this.categoryData.tagSet.map(tag => tag.id);
    this.updateCategoryForm = this.formBuilder.group({
      'id': new FormControl(this.categoryData.id, [Validators.required]),
      'name': new FormControl(this.categoryData.name, [Validators.required, Validators.minLength(2)]),
      'photo': new FormControl(this.categoryData.photo, [Validators.required, Validators.minLength(2)]),
      'description': new FormControl(this.categoryData.description, [Validators.required, Validators.minLength(20)]),
      'likes': new FormControl(this.categoryData.likes, [Validators.required, Validators.minLength(1)]),
      'tagIds': this.formBuilder.array(this.selectedTagsId, this.validateCheckbox()),
    });
  }

  onCheckboxChanged(event: any) {
    console.log('Checkbox changed:', event.target.checked, event.target.value);
    const tags = this.updateCategoryForm.get('tagIds') as FormArray;

    if (event.target.checked) {
      tags.push(new FormControl(event.target.value));
    } else {
      const index = tags.controls.findIndex((control) => control.value === event.target.value);
      tags.removeAt(index);
    }
  }

  handleEmitEvent() {
    this.tagStateService.getActiveTags().subscribe((activeTags) => {
      this.tags = activeTags;
      this.tagStateService.setActiveTagsSubject(activeTags);
    })
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;

      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  updateCategory(): void {
    this.ngxService.start();
    if (this.updateCategoryForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.updateCategoryForm.value.tagIds

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.updateCategoryForm.value,
        tagIds: tagIdsString
      };
      this.categoryService.updateCategory(formData)
        .subscribe((response: any) => {
          this.onUpdateCategoryEmit.emit();
          this.updateCategoryForm.reset();
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
    this.dialogRef.close('Dialog closed without updating category');
  }

  clear() {
    this.updateCategoryForm.reset();
  }

}

