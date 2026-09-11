import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Testimonials } from 'src/app/models/testimonials.model';
import { Centers } from 'src/app/models/centers.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { selectCenters } from 'src/app/state/center/center.selectors';
import { loadCenters } from 'src/app/state/center/center.actions';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadTrainers } from 'src/app/state/trainer/trainer.actions';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Edits a pending (not-yet-active) testimonial. The backend rejects any
 * update once a testimonial's status flips to active, so the form is
 * disabled up front for those rather than letting the admin submit into a
 * guaranteed error.
 */
@Component({
  selector: 'app-update-testimonials-modal',
  templateUrl: './update-testimonials-modal.component.html',
  styleUrls: ['./update-testimonials-modal.component.css']
})
export class UpdateTestimonialsModalComponent implements OnInit {
  onUpdateTestimonialEmit = new EventEmitter();
  updateTestimonialForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  testimonialData: Testimonials;
  centers: Centers[] = [];
  trainers: Trainers[] = [];

  get isActive(): boolean {
    return this.testimonialData?.status === 'true';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private testimonialService: TestimonialService,
    private store: Store,
    public dialogRef: MatDialogRef<UpdateTestimonialsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) {
    this.testimonialData = this.data.testimonialData;
  }

  ngOnInit(): void {
    const target = this.testimonialData.centerId ? 'center' : this.testimonialData.trainerId ? 'trainer' : 'general';

    this.updateTestimonialForm = this.formBuilder.group({
      target: [target],
      centerId: [this.testimonialData.centerId || ''],
      trainerId: [this.testimonialData.trainerId || ''],
      testimonial: [this.testimonialData.testimonial, [Validators.required, Validators.minLength(10)]],
    });

    if (this.isActive) this.updateTestimonialForm.disable();

    this.store.dispatch(loadCenters());
    this.store.dispatch(loadTrainers());
    this.store.select(selectCenters).subscribe(centers => this.centers = centers);
    this.store.select(selectTrainers).subscribe(trainers => this.trainers = trainers);
  }

  updateTestimonial(): void {
    if (this.isActive || this.updateTestimonialForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    const { target, centerId, trainerId, testimonial } = this.updateTestimonialForm.value;

    this.submitting = true;
    this.ngxService.start();
    this.testimonialService.updateTestimonial({
      id: this.testimonialData.id,
      centerId: target === 'center' ? Number(centerId) : null,
      trainerId: target === 'trainer' ? Number(trainerId) : null,
      testimonial,
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onUpdateTestimonialEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Testimonial updated successfully');
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
    this.dialogRef.close('Dialog closed without updating the testimonial');
  }
}
