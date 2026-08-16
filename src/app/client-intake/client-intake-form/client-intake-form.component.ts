import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { ClientIntake } from 'src/app/models/client-intake.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import {
  createClientIntake,
  createClientIntakeFailure,
  createClientIntakeSuccess,
  loadClientIntake,
  loadClientIntakeFailure,
  updateClientIntake,
  updateClientIntakeFailure,
  updateClientIntakeSuccess,
} from 'src/app/state/client-intake/client-intake.actions';
import { selectClientIntakeLoading, selectSelectedClientIntake } from 'src/app/state/client-intake/client-intake.selectors';

import { genericError } from 'src/validators/form-validators.module';

/**
 * Trainer-initiated client onboarding / pre-activity screening form
 * (PAR-Q-style: medical history, medications, injuries/limitations, training
 * history, emergency contact, consent).
 *
 * IMPORTANT — see the non-dismissible disclosure banner at the top of the
 * template (same pattern as terms-page.component.html): the consent
 * language here has NOT been reviewed by a licensed attorney or medical
 * professional. This is real functionality, not a placeholder — but it must
 * not be treated as a legally binding waiver until that review happens.
 *
 * Two entry modes, driven by route params:
 *  - create: /client-intake/new/:clientId  (trainer starting a new intake)
 *  - edit:   /client-intake/:id            (client or the assigned trainer)
 */
@Component({
  selector: 'app-client-intake-form',
  templateUrl: './client-intake-form.component.html',
  styleUrls: ['./client-intake-form.component.css']
})
export class ClientIntakeFormComponent implements OnInit, OnDestroy {

  form: FormGroup;

  mode: 'create' | 'edit' = 'create';
  intakeId: number | null = null;
  clientId: number | null = null;
  clientName: string | null = null;

  loading = false;
  accessDenied = false;
  notFound = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
  ) {
    this.form = this.fb.group({
      medicalConditions: [''],
      medications: [''],
      injuriesOrLimitations: [''],
      trainingHistory: [''],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', Validators.required],
      consentAcknowledged: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    const clientIdParam = this.route.snapshot.paramMap.get('clientId');
    const idParam = this.route.snapshot.paramMap.get('id');
    this.clientName = this.route.snapshot.queryParamMap.get('clientName');

    if (clientIdParam) {
      this.mode = 'create';
      this.clientId = Number(clientIdParam);
    } else if (idParam) {
      this.mode = 'edit';
      this.intakeId = Number(idParam);
      this.store.dispatch(loadClientIntake({ id: this.intakeId }));
    }

    this.store.select(selectClientIntakeLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    if (this.mode === 'edit') {
      this.store.select(selectSelectedClientIntake)
        .pipe(takeUntil(this.destroy$))
        .subscribe(intake => {
          if (intake) this.patchForm(intake);
        });
    }

    this.actions$
      .pipe(ofType(loadClientIntakeFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.handleError(error));

    this.actions$
      .pipe(ofType(createClientIntakeSuccess, updateClientIntakeSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.snackBar.openSnackBar(response?.message || 'Intake saved', '');
        if (response?.data?.id) {
          this.router.navigate(['/client-intake', response.data.id]);
        }
      });

    this.actions$
      .pipe(ofType(createClientIntakeFailure, updateClientIntakeFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.handleError(error));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = { ...this.form.value };

    if (this.mode === 'create') {
      payload.clientId = this.clientId;
      this.store.dispatch(createClientIntake({ data: payload }));
    } else {
      payload.id = this.intakeId;
      this.store.dispatch(updateClientIntake({ data: payload }));
    }
  }

  private patchForm(intake: ClientIntake): void {
    this.form.patchValue({
      medicalConditions: intake.medicalConditions,
      medications: intake.medications,
      injuriesOrLimitations: intake.injuriesOrLimitations,
      trainingHistory: intake.trainingHistory,
      emergencyContactName: intake.emergencyContactName,
      emergencyContactPhone: intake.emergencyContactPhone,
      consentAcknowledged: !!intake.consentAcknowledgedAt,
    });
    this.clientId = intake.clientId;
    this.clientName = `${intake.clientFirstname ?? ''} ${intake.clientLastname ?? ''}`.trim() || intake.clientEmail;
  }

  /** Distinguishes an access-denied response from any other failure so we can show a dedicated state. */
  private handleError(error: string): void {
    const msg = (error || '').toLowerCase();
    if (msg.includes('not authorized') || msg.includes('unauthorized')) {
      this.accessDenied = true;
    } else if (msg.includes('not found')) {
      this.notFound = true;
    } else {
      this.snackBar.openSnackBar(error || genericError, 'error');
    }
  }
}
