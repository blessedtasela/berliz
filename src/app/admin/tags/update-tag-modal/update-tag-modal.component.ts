import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { genericError } from 'src/validators/form-validators.module';
import { AddTagModalComponent } from '../add-tag-modal/add-tag-modal.component';
import { Tags } from 'src/app/models/tags.interface';

@Component({
  selector: 'app-update-tag-modal',
  templateUrl: './update-tag-modal.component.html',
  styleUrls: ['./update-tag-modal.component.css']
})
export class UpdateTagModalComponent {
  onUpdateTagEmit = new EventEmitter();
  updateTagForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  tagData!: Tags;

  constructor(private formBuilder: FormBuilder,
    private tagService: TagService,
    private router: Router,
    public dialogRef: MatDialogRef<UpdateTagModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.tagData = this.data.tagData;
  }

  ngOnInit(): void {
    this.updateTagForm = this.formBuilder.group({
      'id': new FormControl(this.tagData.id, [Validators.required, Validators.minLength(2)]),
      'name': new FormControl(this.tagData.name, [Validators.required, Validators.minLength(2)]),
      'description': new FormControl(this.tagData.description, [Validators.required, Validators.minLength(20)]),
    });

  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating tag')
  }

  updateTag(): void {
    this.ngxService.start();
    if (this.updateTagForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.tagService.updateTag(this.updateTagForm.value)
        .subscribe((response: any) => {
          this.updateTagForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Tag updated successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onUpdateTagEmit.emit();
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  clear() {
    this.updateTagForm.reset();
  }

}

