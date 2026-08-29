import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Centers } from 'src/app/models/centers.interface';
import { Clients } from 'src/app/models/clients.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { loadActiveCenters } from 'src/app/state/center/center.actions';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';
import { loadActiveTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadMyClient } from 'src/app/state/client/client.actions';
import { selectMyClient } from 'src/app/state/client/client.selectors';
import {
  addTestimonial,
  addTestimonialFailure,
  addTestimonialSuccess
} from 'src/app/state/testimonial/testimonial.actions';

import { genericError } from 'src/validators/form-validators.module';

export type TestimonialTarget = 'center' | 'trainer' | 'general';

export interface TestimonialFormData {
  email?: string;
}

/** Normalised shape for the "who is this about" picker. */
export interface TestimonialTargetOption {
  id: number;
  name: string;
  subtitle: string;
}

@Component({
  selector: 'app-testimonial-form',
  templateUrl: './testimonial-form.component.html',
  styleUrls: ['./testimonial-form.component.css']
})
export class TestimonialFormComponent implements OnInit, OnDestroy {

  testimonialForm!: FormGroup;
  invalidForm = false;
  submitting = false;

  centers: Centers[] = [];
  trainers: Trainers[] = [];

  /**
   * The backend resolves the *author* of the testimonial from the JWT, but
   * `TestimonialRequest.clientId` is a separate, required FK to the `client`
   * table (`clientRepo.findById(request.getClientId())`). So the form has to
   * send the logged-in user's own Client record id — never the user id, and
   * never a user-selectable field.
   */
  myClient: Clients | null = null;

  searchTerm = '';
  /** Whether the target picker's option list is expanded. Collapses to a
   *  "selected" trigger once something is chosen, instead of staying open
   *  showing the full list underneath the chosen value. */
  pickerOpen = true;
  readonly maxLength = 1000;
  readonly minLength = 20;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<TestimonialFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TestimonialFormData
  ) { }

  ngOnInit(): void {
    this.testimonialForm = this.fb.group({
      target: ['center' as TestimonialTarget, Validators.required],
      targetId: [null, Validators.required],
      testimonial: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.minLength),
        Validators.maxLength(this.maxLength)
      ])]
    });

    this.store.dispatch(loadActiveCenters());
    this.store.dispatch(loadActiveTrainers());
    this.store.dispatch(loadMyClient());

    this.store.select(selectActiveCenters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(centers => this.centers = centers ?? []);

    this.store.select(selectActiveTrainers)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainers => this.trainers = trainers ?? []);

    this.store.select(selectMyClient)
      .pipe(takeUntil(this.destroy$))
      .subscribe(client => this.myClient = client ?? null);

    this.actions$
      .pipe(ofType(addTestimonialSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.submitting = false;
        this.snackBar.openSnackBar(
          response?.data?.message || response?.message ||
          'Thank you! Your testimonial was submitted and is awaiting review.',
          ''
        );
        this.dialogRef.close(true);
      });

    this.actions$
      .pipe(ofType(addTestimonialFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.submitting = false;
        this.snackBar.openSnackBar(error || genericError, 'error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Target picker ─────────────────────────────────────────────────────────

  get target(): TestimonialTarget {
    return this.testimonialForm?.get('target')?.value ?? 'center';
  }

  get targetId(): number | null {
    return this.testimonialForm?.get('targetId')?.value ?? null;
  }

  /** True for the "About Berliz" target — nothing to pick, no picker shown. */
  get isGeneral(): boolean {
    return this.target === 'general';
  }

  /** All options for the currently selected target type. */
  get options(): TestimonialTargetOption[] {
    if (this.target === 'general') return [];

    return this.target === 'center'
      ? this.centers.map(c => ({
        id: c.id,
        name: c.name,
        subtitle: c.location || c.address || ''
      }))
      : this.trainers.map(t => ({
        id: t.id,
        name: t.name || `${t.userFirstname ?? ''} ${t.userLastname ?? ''}`.trim(),
        subtitle: t.experience ? `${t.experience} experience` : (t.address || '')
      }));
  }

  /** Options narrowed by the search box. */
  get filteredOptions(): TestimonialTargetOption[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.options;
    return this.options.filter(o =>
      o.name.toLowerCase().includes(term) || o.subtitle.toLowerCase().includes(term)
    );
  }

  get selectedOption(): TestimonialTargetOption | null {
    const id = this.targetId;
    if (id == null) return null;
    return this.options.find(o => o.id === id) ?? null;
  }

  setTarget(target: TestimonialTarget): void {
    if (this.target === target) return;

    this.testimonialForm.patchValue({ target, targetId: null });
    this.searchTerm = '';
    this.pickerOpen = true;

    // "About Berliz" has nothing to select, so `targetId` must stop being
    // required — otherwise the form could never become valid for that option.
    const targetIdControl = this.testimonialForm.get('targetId');
    if (target === 'general') {
      targetIdControl?.clearValidators();
      targetIdControl?.markAsUntouched();
    } else {
      targetIdControl?.setValidators(Validators.required);
    }
    targetIdControl?.updateValueAndValidity();
  }

  chooseTarget(option: TestimonialTargetOption): void {
    this.testimonialForm.patchValue({ targetId: option.id });
    this.testimonialForm.get('targetId')?.markAsTouched();
    this.pickerOpen = false;
  }

  /** Re-opens the picker to change a selection already made. */
  openPicker(): void {
    this.searchTerm = '';
    this.pickerOpen = true;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement)?.value ?? '';
  }

  get remaining(): number {
    const value: string = this.testimonialForm?.get('testimonial')?.value ?? '';
    return this.maxLength - value.length;
  }

  // ── Submit / close ────────────────────────────────────────────────────────

  submitForm(): void {
    if (this.submitting) return;

    if (this.testimonialForm.invalid) {
      this.invalidForm = true;
      this.testimonialForm.markAllAsTouched();
      return;
    }

    if (!this.myClient?.id) {
      this.snackBar.openSnackBar(
        'We could not find your client profile. Complete your client profile before leaving a testimonial.',
        'error'
      );
      return;
    }

    const value = this.testimonialForm.value;

    // Matches TestimonialRequest: at most one of centerId / trainerId, plus the
    // author's own clientId. For the "About Berliz" (general) target both are
    // explicitly null — that is how the backend recognises a general
    // testimonial. `email` is deliberately omitted — it is admin-only and is
    // handled by the admin testimonials module.
    const payload = {
      id: null,
      centerId: value.target === 'center' ? Number(value.targetId) : null,
      trainerId: value.target === 'trainer' ? Number(value.targetId) : null, // both null when target === 'general'
      clientId: this.myClient.id,
      testimonial: (value.testimonial ?? '').trim()
    };

    this.invalidForm = false;
    this.submitting = true;
    this.store.dispatch(addTestimonial({ data: payload }));
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
