import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Clients } from 'src/app/models/clients.interface';
import { Centers } from 'src/app/models/centers.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { selectClients } from 'src/app/state/client/client.selectors';
import { loadClients } from 'src/app/state/client/client.actions';
import { selectCenters } from 'src/app/state/center/center.selectors';
import { loadCenters } from 'src/app/state/center/center.actions';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadTrainers } from 'src/app/state/trainer/trainer.actions';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin-authored testimonial on behalf of a client. Rebuilt against the
 * real backend contract (TestimonialRequest: email + clientId + optional
 * centerId XOR trainerId + testimonial text) — the previous version of
 * this form posted an unrelated {name, photo, description, likes, tagIds}
 * shape (copy-pasted from some other entity's form) that the backend has
 * never accepted.
 */
@Component({
  selector: 'app-add-testimonials-modal',
  templateUrl: './add-testimonials-modal.component.html',
  styleUrls: ['./add-testimonials-modal.component.css']
})
export class AddTestimonialsModalComponent implements OnInit {
  onAddTestimonialEmit = new EventEmitter();
  addTestimonialForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  clients: Clients[] = [];
  centers: Centers[] = [];
  trainers: Trainers[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private testimonialService: TestimonialService,
    private store: Store,
    public dialogRef: MatDialogRef<AddTestimonialsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.addTestimonialForm = this.formBuilder.group({
      clientId: ['', Validators.required],
      target: ['general'], // 'general' | 'center' | 'trainer'
      centerId: [''],
      trainerId: [''],
      testimonial: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.store.dispatch(loadClients());
    this.store.dispatch(loadCenters());
    this.store.dispatch(loadTrainers());
    this.store.select(selectClients).subscribe(clients => this.clients = clients);
    this.store.select(selectCenters).subscribe(centers => this.centers = centers);
    this.store.select(selectTrainers).subscribe(trainers => this.trainers = trainers);
  }

  addTestimonial(): void {
    if (this.addTestimonialForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    const { clientId, target, centerId, trainerId, testimonial } = this.addTestimonialForm.value;
    const client = this.clients.find(c => c.id === Number(clientId));
    if (!client) {
      this.snackbarService.openSnackBar('Selected client could not be found.', 'error');
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.testimonialService.addTestimonial({
      email: client.user.email,
      clientId: client.id,
      centerId: target === 'center' ? Number(centerId) : null,
      trainerId: target === 'trainer' ? Number(trainerId) : null,
      testimonial,
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onAddTestimonialEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Testimonial added successfully');
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
    this.dialogRef.close('Dialog closed without adding a testimonial');
  }

  clear(): void {
    this.addTestimonialForm.reset({ target: 'general' });
    this.invalidForm = false;
  }
}
