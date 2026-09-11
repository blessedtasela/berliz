import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { Categories } from 'src/app/models/categories.interface';
import { MemberService } from 'src/app/services/member.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectUsers } from 'src/app/state/user/user.selector';
import { loadActiveUsers } from 'src/app/state/user/user.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin-added member profile for an existing user. Rebuilt against the
 * real backend contract (MemberRequest: userId + height/weight/
 * medicalConditions/motivation/targetWeight + optional categoryIds) — the
 * previous version of this form was a copy-paste of add-category-modal
 * (down to its unrelated {name, photo, description, likes, tagIds} fields
 * and even `MatDialogRef<AddCategoryModalComponent>`) that the backend has
 * never accepted.
 */
@Component({
  selector: 'app-add-members-modal',
  templateUrl: './add-members-modal.component.html',
  styleUrls: ['./add-members-modal.component.css']
})
export class AddMembersModalComponent implements OnInit {
  onAddMemberEmit = new EventEmitter();
  addMemberForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  users: Users[] = [];
  categories: Categories[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private store: Store,
    public dialogRef: MatDialogRef<AddMembersModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.addMemberForm = this.formBuilder.group({
      userId: ['', Validators.required],
      height: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.min(1)]],
      targetWeight: ['', [Validators.required, Validators.min(1)]],
      motivation: ['', [Validators.required, Validators.minLength(10)]],
      medicalConditions: ['None'],
      categoryIds: [[]],
    });

    this.store.dispatch(loadActiveUsers());
    this.store.dispatch(loadActiveCategories());
    this.store.select(selectUsers).subscribe(users => this.users = users);
    this.store.select(selectActiveCategories).subscribe(categories => this.categories = categories);
  }

  onCategoryToggle(categoryId: number, event: any): void {
    const control = this.addMemberForm.get('categoryIds');
    const current: number[] = control?.value || [];
    const checked = event.target.checked;
    control?.setValue(checked ? [...current, categoryId] : current.filter(id => id !== categoryId));
  }

  addMember(): void {
    if (this.addMemberForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.memberService.addMember({
      userId: Number(this.addMemberForm.value.userId),
      height: Number(this.addMemberForm.value.height),
      weight: Number(this.addMemberForm.value.weight),
      targetWeight: Number(this.addMemberForm.value.targetWeight),
      motivation: this.addMemberForm.value.motivation,
      medicalConditions: this.addMemberForm.value.medicalConditions,
      categoryIds: this.addMemberForm.value.categoryIds,
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onAddMemberEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Member added successfully');
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
    this.dialogRef.close('Dialog closed without adding a member');
  }

  clear(): void {
    this.addMemberForm.reset({ medicalConditions: 'None', categoryIds: [] });
    this.invalidForm = false;
  }
}
