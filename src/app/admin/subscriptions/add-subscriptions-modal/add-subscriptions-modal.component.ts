import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, forkJoin, take } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Clients } from 'src/app/models/clients.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-subscriptions-modal',
  templateUrl: './add-subscriptions-modal.component.html',
  styleUrls: ['./add-subscriptions-modal.component.css']
})
export class AddSubscriptionsModalComponent {
  onAddSubscriptionEmit = new EventEmitter();
  addSubscriptionForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  users: Users[] = [];
  trainers: Trainers[] = [];
  centers: Centers[] = [];
  selectedIcon: string = '../../../../../assets/icons/gym';
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private subscriptionService: SubscriptionService,
    private userStateService: UserStateService,
    private trainerStateService: TrainerStateService,
    private centerStateService: CenterStateService,
    public dialogRef: MatDialogRef<AddSubscriptionsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {
  }

  ngOnInit(): void {
    this.addSubscriptionForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'photo': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    forkJoin([
      this.centerStateService.activeCentersData$.pipe(take(1)),
      this.trainerStateService.activeTrainersData$.pipe(take(1)),
      this.userStateService.activeUserData$.pipe(take(1))
    ]).subscribe(([centers, trainers, users]) => {
      if (centers === null) {
        this.handleEmitEvent()
      } else {
        this.centers = centers;
      }
      if (trainers === null) {
        this.handleEmitEvent()
      } else {
        this.trainers = trainers
      }
      if (users === null) {
        this.handleEmitEvent()
      } else {
        this.users = users
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscriptions.push(
      this.userStateService.getActiveUsers().subscribe((users) => {
        this.ngxService.start();
        this.users = users;
        this.userStateService.setActiveUsersSubject(users);
        this.cd.detectChanges();
        this.ngxService.stop();
      }),
      this.trainerStateService.getActiveTrainers().subscribe((trainers) => {
        this.ngxService.start();
        this.trainers = trainers;
        this.trainerStateService.setActiveTrainersSubject(trainers);
        this.cd.detectChanges();
        this.ngxService.stop();
      }),
      this.centerStateService.getActiveCenters().subscribe((centers) => {
        this.ngxService.start();
        this.centers = centers;
        this.centerStateService.setAllCentersSubject(centers);
        this.cd.detectChanges();
        this.ngxService.stop();
      }),
    );
  }


  onCheckboxChanged(event: any) {
    const users = this.addSubscriptionForm.get('tagIds') as FormArray;
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
    if (this.addSubscriptionForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addSubscriptionForm.value.tagIds.map((tag: any) => tag.tagIds);

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addSubscriptionForm.value,
        tagIds: tagIdsString
      };
      this.subscriptionService.addSubscription(formData)
        .subscribe((response: any) => {
          this.onAddSubscriptionEmit.emit();
          this.addSubscriptionForm.reset();
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
    this.addSubscriptionForm.reset();
    this.selectedIcon = '../../../../../assets/icons/gym';
    this.onCheckboxChanged(event)
  }


}

