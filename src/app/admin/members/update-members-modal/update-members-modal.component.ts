import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Members } from 'src/app/models/members.interface';
import { Categories } from 'src/app/models/categories.interface';
import { MemberService } from 'src/app/services/member.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Edits a pending (not-yet-active) member profile. The backend rejects any
 * update once membership status flips to active, so the form is disabled
 * up front for those rather than letting the admin submit into a
 * guaranteed error.
 */
@Component({
  selector: 'app-update-members-modal',
  templateUrl: './update-members-modal.component.html',
  styleUrls: ['./update-members-modal.component.css']
})
export class UpdateMembersModalComponent implements OnInit {
  onUpdateMemberEmit = new EventEmitter();
  updateMemberForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  memberData: Members;
  categories: Categories[] = [];

  get isActive(): boolean {
    return this.memberData?.status === 'true';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private store: Store,
    public dialogRef: MatDialogRef<UpdateMembersModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) {
    this.memberData = this.data.memberData;
  }

  ngOnInit(): void {
    this.updateMemberForm = this.formBuilder.group({
      height: [this.memberData.height, [Validators.required, Validators.min(1)]],
      weight: [this.memberData.weight, [Validators.required, Validators.min(1)]],
      targetWeight: [this.memberData.targetWeight, [Validators.required, Validators.min(1)]],
      motivation: [this.memberData.motivation, [Validators.required, Validators.minLength(10)]],
      medicalConditions: [this.memberData.medicalConditions],
      categoryIds: [(this.memberData.categories || []).map(c => c.id)],
    });

    if (this.isActive) this.updateMemberForm.disable();

    this.store.dispatch(loadActiveCategories());
    this.store.select(selectActiveCategories).subscribe(categories => this.categories = categories);
  }

  isCategorySelected(categoryId: number): boolean {
    return (this.updateMemberForm.get('categoryIds')?.value || []).includes(categoryId);
  }

  onCategoryToggle(categoryId: number, event: any): void {
    const control = this.updateMemberForm.get('categoryIds');
    const current: number[] = control?.value || [];
    const checked = event.target.checked;
    control?.setValue(checked ? [...current, categoryId] : current.filter(id => id !== categoryId));
  }

  updateMember(): void {
    if (this.isActive || this.updateMemberForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.memberService.updateMember({
      id: this.memberData.id,
      height: Number(this.updateMemberForm.value.height),
      weight: Number(this.updateMemberForm.value.weight),
      targetWeight: Number(this.updateMemberForm.value.targetWeight),
      motivation: this.updateMemberForm.value.motivation,
      medicalConditions: this.updateMemberForm.value.medicalConditions,
      categoryIds: this.updateMemberForm.value.categoryIds,
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onUpdateMemberEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Member updated successfully');
      },
      error: (error: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.responseMessage = error.error?.message || genericError;
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close('Dialog closed without updating the member');
  }
}
