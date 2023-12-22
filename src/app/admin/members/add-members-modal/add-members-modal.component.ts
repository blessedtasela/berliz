import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { genericError } from 'src/validators/form-validators.module';
import { AddCategoryModalComponent } from '../../categories/add-category-modal/add-category-modal.component';
import { MemberService } from 'src/app/services/member.service';

@Component({
  selector: 'app-add-members-modal',
  templateUrl: './add-members-modal.component.html',
  styleUrls: ['./add-members-modal.component.css']
})
export class AddMembersModalComponent {
  onAddMemberEmit = new EventEmitter();
  addMemberForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  subscriptions: Subscriptions[] = [];
  selectedPhoto: any;
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private memberService: MemberService,
    private subscriptionStateService: SubscriptionStateService,
    public dialogRef: MatDialogRef<AddCategoryModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {

  }

  ngOnInit(): void {
    this.addMemberForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'photo': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.subscriptionStateService.activeSubscriptionsData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent();
      } else {
        this.subscriptions = cachedData
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscription.add(
      this.subscriptionStateService.getActiveSubscriptions().subscribe((subs) => {
        this.ngxService.start();
        this.subscriptions = subs;
        this.subscriptionStateService.setActiveSubscriptionsSubject(subs);
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      })
    );
  }


  onCheckboxChanged(event: any) {
    const tags = this.addMemberForm.get('tagIds') as FormArray;
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
    if (this.addMemberForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addMemberForm.value.tagIds.map((tag: any) => tag.tagIds);

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addMemberForm.value,
        tagIds: tagIdsString
      };
      this.memberService.addMember(formData)
        .subscribe((response: any) => {
          this.onAddMemberEmit.emit();
          this.addMemberForm.reset();
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
    this.addMemberForm.reset();
    this.onCheckboxChanged(event)
  }


}

