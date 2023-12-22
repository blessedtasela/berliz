import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, forkJoin, take } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-testimonials-modal',
  templateUrl: './add-testimonials-modal.component.html',
  styleUrls: ['./add-testimonials-modal.component.css']
})
export class AddTestimonialsModalComponent {
  onAddTestimonialEmit = new EventEmitter();
  addTestimonialForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  users: Users[] = [];
  centers: Centers[] = [];
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private testimonialService: TestimonialService,
    private userStateService: UserStateService,
    private centerStateService: CenterStateService,
    public dialogRef: MatDialogRef<AddTestimonialsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.addTestimonialForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'photo': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });
    forkJoin([
      this.userStateService.activeUserData$.pipe(take(1)),
      this.centerStateService.activeCentersData$.pipe(take(1))
    ]).subscribe(([users, centers]) => {
      if (users === null) {
        this.handleEmitEvent();
      } else {
        this.users = users
      }
      if (centers === null) {
        this.handleEmitEvent();
      } else {
        this.centers = centers
      }
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub)=> sub.unsubscribe())
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscriptions.push(
      this.userStateService.getActiveUsers().subscribe((users) => {
        this.ngxService.start();
        this.users = users;
        this.userStateService.setActiveUsersSubject(users);
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      }),
      this.centerStateService.getActiveCenters().subscribe((centers) => {
        this.ngxService.start();
        this.centers = centers;
        this.centerStateService.setActiveCentersSubject(centers);
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      })
    );
  }


  onCheckboxChanged(event: any) {
    const centers = this.addTestimonialForm.get('tagIds') as FormArray;
    if (event.target.checked) {
      centers.push(this.formBuilder.group({ tagIds: event.target.value }));
    } else {
      const index = centers.controls.findIndex((control) => control.value.tagIds === event.target.value);
      centers.removeAt(index);
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
    if (this.addTestimonialForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addTestimonialForm.value.tagIds.map((tag: any) => tag.tagIds);

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addTestimonialForm.value,
        tagIds: tagIdsString
      };
      this.testimonialService.addTestimonial(formData)
        .subscribe((response: any) => {
          this.onAddTestimonialEmit.emit();
          this.addTestimonialForm.reset();
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
    this.addTestimonialForm.reset();
    this.onCheckboxChanged(event)
  }


}

