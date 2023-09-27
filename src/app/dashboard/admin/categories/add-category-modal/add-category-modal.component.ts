import { ChangeDetectorRef, Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { genericError } from 'src/validators/form-validators.module';
import { CategoryService } from 'src/app/services/category.service';
import { Icons } from 'src/app/models/categories.interface';
import { Tags } from 'src/app/models/tags.interface';
import { Observable, tap, catchError, of } from 'rxjs';

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

  constructor(private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private tagService: TagService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddCategoryModalComponent>,
    private ngxService: NgxUiLoaderService,
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

    this.getAlltags().subscribe(() => {
      // Data is loaded, manually trigger change detection
      this.cdr.detectChanges();
    });
  }

  onCheckboxChanged(event: any) {
    const tags = this.addCategoryForm.get('tagIds') as FormArray;

    if (event.target.checked) {
      tags.push(this.formBuilder.group({ tagIds: event.target.value }));
    } else {
      // Remove the control by its value
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

  getAlltags(): Observable<Tags[]> {
    return this.tagService.getAllTags()
      .pipe(
        tap((response: any) => {
          this.ngxService.start();
          this.tags = response;
          this.ngxService.stop();
        }),
        catchError((error) => {
          this.ngxService.start();
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
          return of([]);
        })
      );
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
  }

}

