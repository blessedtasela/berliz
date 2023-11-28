import { Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-tag-modal',
  templateUrl: './add-tag-modal.component.html',
  styleUrls: ['./add-tag-modal.component.css']
})
export class AddTagModalComponent {
  onAddTagEmit = new EventEmitter();
  addTagForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;

  constructor(private formBuilder: FormBuilder,
    private tagService: TagService,
    private router: Router,
    public dialogRef: MatDialogRef<AddTagModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) { }

  ngOnInit(): void {
    this.addTagForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
    });

  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a tag')
  }

  addTag(): void {
    this.ngxService.start();
    if (this.addTagForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.tagService.addTag(this.addTagForm.value)
        .subscribe((response: any) => {
          this.addTagForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Tag added sucessfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onAddTagEmit.emit();
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
    this.addTagForm.reset();
  }

}
