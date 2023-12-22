import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-payments-modal',
  templateUrl: './add-payments-modal.component.html',
  styleUrls: ['./add-payments-modal.component.css']
})
export class AddPaymentsModalComponent {
  onAddPaymentEmit = new EventEmitter();
  addPaymentForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  users: Users[] = [];
  selectedPhoto: any;
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private userStateService: UserStateService,
    public dialogRef: MatDialogRef<AddPaymentsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {

  }

  ngOnInit(): void {
    this.addPaymentForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'photo': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.userStateService.activeUserData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent();
      } else {
        this.users = cachedData
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscription.add(
      this.userStateService.getAllUsers().subscribe((users) => {
        this.ngxService.start();
        this.users = users;
        this.userStateService.setAllUsersSubject(users);
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      })
    );
  }


  onCheckboxChanged(event: any) {
    const users = this.addPaymentForm.get('tagIds') as FormArray;
    if (event.target.checked) {
      users.push(this.formBuilder.group({ tagIds: event.target.value }));
    } else {
      const index = users.controls.findIndex((control) => control.value.tagIds === event.target.value);
      users.removeAt(index);
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
    if (this.addPaymentForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addPaymentForm.value.tagIds.map((tag: any) => tag.tagIds);

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addPaymentForm.value,
        tagIds: tagIdsString
      };
      this.paymentService.addPayment(formData)
        .subscribe((response: any) => {
          this.onAddPaymentEmit.emit();
          this.addPaymentForm.reset();
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
    this.addPaymentForm.reset();
    this.onCheckboxChanged(event)
  }


}

