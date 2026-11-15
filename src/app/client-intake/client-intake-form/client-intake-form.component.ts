import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { ClientIntake, ClientIntakeAuditEntry, PARQ_QUESTIONS } from 'src/app/models/client-intake.model';
import { AuthService } from 'src/app/services/auth.service';
import { ClientIntakeService } from 'src/app/services/client-intake.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import {
  loadClientIntake,
  loadClientIntakeFailure,
  saveClientIntakeDraft,
  saveClientIntakeDraftFailure,
  saveClientIntakeDraftSuccess,
  sendClientIntake,
  sendClientIntakeFailure,
  sendClientIntakeSuccess,
  signClientIntake,
  signClientIntakeFailure,
  signClientIntakeSuccess,
} from 'src/app/state/client-intake/client-intake.actions';
import { selectClientIntakeLoading, selectSelectedClientIntake } from 'src/app/state/client-intake/client-intake.selectors';

import { genericError } from 'src/validators/form-validators.module';

/**
 * BK-47: a locked, signed PAR-Q. Two entry modes, driven by route params:
 *  - create: /client-intake/new/:clientId  (trainer sending a new PAR-Q)
 *  - edit:   /client-intake/:id            (client, the assigned trainer, or an admin)
 *
 * Once signed (status COMPLETED or LOCKED), the record is read-only for client and trainer --
 * only the client can request an edit, and only a super admin can grant one or edit directly.
 * The consent/signature language here has not been reviewed by a lawyer -- see the disclosure
 * text below the signature section.
 */
@Component({
    selector: 'app-client-intake-form',
    templateUrl: './client-intake-form.component.html',
    styleUrls: ['./client-intake-form.component.css'],
    standalone: false
})
export class ClientIntakeFormComponent implements OnInit, OnDestroy {

  form: FormGroup;
  signForm: FormGroup;
  adminForm: FormGroup;

  readonly questions = PARQ_QUESTIONS;

  mode: 'create' | 'edit' = 'create';
  intakeId: number | null = null;
  clientId: number | null = null;
  clientName: string | null = null;

  intake: ClientIntake | null = null;

  loading = false;
  accessDenied = false;
  notFound = false;
  /** The intake could not be loaded for a reason other than denied/not-found; shown inline with a Retry. */
  loadError: string | null = null;
  /** Inline message above the submit button: validation problems and failed saves. */
  submitError: string | null = null;

  showAdminEdit = false;
  showRequestEdit = false;
  requestEditReason = '';
  requestEditError: string | null = null;
  requestEditSaving = false;

  decidingEdit = false;
  decideNote = '';
  decideError: string | null = null;

  auditLog: ClientIntakeAuditEntry[] | null = null;
  auditLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
    private authService: AuthService,
    private clientIntakeService: ClientIntakeService,
  ) {
    this.form = this.buildFieldsGroup();
    this.signForm = this.fb.group({
      signedName: ['', Validators.required],
      consentAcknowledged: [false, Validators.requiredTrue],
      ...this.buildQuestionControls(),
    });
    this.adminForm = this.fb.group({
      ...this.buildFieldsGroup().controls,
      reason: ['', Validators.required],
    });
  }

  private buildFieldsGroup(): FormGroup {
    return this.fb.group({
      medicalConditions: [''],
      medications: [''],
      injuriesOrLimitations: [''],
      trainingHistory: [''],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', Validators.required],
    });
  }

  private buildQuestionControls(): Record<string, any> {
    const controls: Record<string, any> = {};
    for (const q of this.questions) controls[q.key as string] = [null, Validators.required];
    return controls;
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
          if (intake) this.onIntakeLoaded(intake);
        });
    }

    this.actions$
      .pipe(ofType(loadClientIntakeFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.handleError(error));

    this.actions$
      .pipe(ofType(sendClientIntakeSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.submitError = null;
        this.snackBar.openSnackBar(response?.message || 'PAR-Q sent', '');
        if (response?.data?.id) {
          // replaceUrl: a fresh PAR-Q's URL (.../client-intake/new/:clientId) is swapped for its
          // real id here -- without it, going back would land on the now-pointless "new" form.
          this.router.navigate(['/dashboard/client-intake', response.data.id], { replaceUrl: true });
        }
      });

    this.actions$
      .pipe(ofType(sendClientIntakeFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.handleSaveError(error));

    this.actions$
      .pipe(ofType(saveClientIntakeDraftSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.submitError = null;
        this.snackBar.openSnackBar(response?.message || 'Saved', '');
      });

    this.actions$
      .pipe(ofType(saveClientIntakeDraftFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.handleSaveError(error));

    this.actions$
      .pipe(ofType(signClientIntakeSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.submitError = null;
        this.snackBar.openSnackBar(response?.message || 'PAR-Q signed', '');
      });

    this.actions$
      .pipe(ofType(signClientIntakeFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.handleSaveError(error));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.form.controls;
  }

  get sf() {
    return this.signForm.controls;
  }

  get currentUserId(): number | null {
    return this.authService.getCurrentUserId();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /** The client this PAR-Q is about, viewing their own record. Not even an admin counts --
   *  signing is a personal attestation, never done on someone's behalf. */
  get isSigner(): boolean {
    return !!this.intake && this.intake.clientId === this.currentUserId;
  }

  /** Open for the client to answer and sign: first time (SENT) or during a granted edit window. */
  get canSignNow(): boolean {
    return this.isSigner && !!this.intake && (this.intake.status === 'SENT' || this.intake.status === 'EDIT_GRANTED');
  }

  /** The creating trainer (or an admin just looking) co-filling free-text answers before the
   *  client has signed -- the "Fill Together" workflow this feature preserves. */
  get canSaveDraftNow(): boolean {
    return !this.isSigner && !!this.intake && this.intake.status === 'SENT';
  }

  get isReadOnlyLocked(): boolean {
    return !!this.intake && (this.intake.status === 'COMPLETED' || this.intake.status === 'LOCKED' || this.intake.status === 'EDIT_REQUESTED');
  }

  get canRequestEdit(): boolean {
    return this.isSigner && !!this.intake && (this.intake.status === 'COMPLETED' || this.intake.status === 'LOCKED');
  }

  get canDecideEditRequest(): boolean {
    return this.isAdmin && !!this.intake && this.intake.status === 'EDIT_REQUESTED';
  }

  retryLoad(): void {
    if (this.intakeId == null) return;
    this.loadError = null;
    this.store.dispatch(loadClientIntake({ id: this.intakeId }));
  }

  /** Trainer sending a brand-new PAR-Q. */
  submit(): void {
    this.submitError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError = 'Fill in the emergency contact name and phone before sending.';
      return;
    }

    const payload: any = { ...this.form.value, clientId: this.clientId };
    this.store.dispatch(sendClientIntake({ data: payload }));
  }

  /** Trainer (or admin) saving co-filled answers before the client signs. */
  saveDraft(): void {
    this.submitError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError = 'Fill in the emergency contact name and phone before saving.';
      return;
    }

    const payload: any = { ...this.form.value, id: this.intakeId };
    this.store.dispatch(saveClientIntakeDraft({ data: payload }));
  }

  /** The client signing -- first time, or saving a granted edit window. */
  sign(): void {
    this.submitError = null;
    if (this.form.invalid || this.signForm.invalid) {
      this.form.markAllAsTouched();
      this.signForm.markAllAsTouched();
      this.submitError = 'Answer every question, fill in the emergency contact, type your name, and confirm before signing.';
      return;
    }

    const payload: any = { ...this.form.value, ...this.signForm.value, id: this.intakeId };
    this.store.dispatch(signClientIntake({ data: payload }));
  }

  openRequestEdit(): void {
    this.showRequestEdit = true;
    this.requestEditReason = '';
    this.requestEditError = null;
  }

  submitRequestEdit(): void {
    if (!this.intakeId || !this.requestEditReason.trim()) {
      this.requestEditError = 'A reason is required.';
      return;
    }
    this.requestEditSaving = true;
    this.clientIntakeService.requestEdit(this.intakeId, this.requestEditReason.trim()).subscribe({
      next: res => {
        this.requestEditSaving = false;
        this.showRequestEdit = false;
        if (res.data) this.onIntakeLoaded(res.data);
        this.snackBar.openSnackBar(res.message || 'Edit request sent', '');
      },
      error: err => {
        this.requestEditSaving = false;
        this.requestEditError = err?.error?.message || genericError;
      },
    });
  }

  decideEditRequest(approve: boolean): void {
    if (!this.intakeId) return;
    if (!approve && !this.decideNote.trim()) {
      this.decideError = 'A note is required when denying.';
      return;
    }
    this.decidingEdit = true;
    this.clientIntakeService.decideEditRequest(this.intakeId, { approve, note: this.decideNote.trim() || undefined }).subscribe({
      next: res => {
        this.decidingEdit = false;
        this.decideNote = '';
        this.decideError = null;
        if (res.data) this.onIntakeLoaded(res.data);
        this.snackBar.openSnackBar(res.message || 'Decision recorded', '');
      },
      error: err => {
        this.decidingEdit = false;
        this.decideError = err?.error?.message || genericError;
      },
    });
  }

  openAdminEdit(): void {
    this.showAdminEdit = true;
    if (this.intake) this.adminForm.patchValue({ ...this.intake, reason: '' });
  }

  submitAdminEdit(): void {
    if (!this.intakeId || this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }
    this.clientIntakeService.adminEditIntake(this.intakeId, this.adminForm.value).subscribe({
      next: res => {
        this.showAdminEdit = false;
        if (res.data) this.onIntakeLoaded(res.data);
        this.snackBar.openSnackBar(res.message || 'PAR-Q updated', '');
      },
      error: err => {
        this.submitError = err?.error?.message || genericError;
      },
    });
  }

  toggleAuditLog(): void {
    if (this.auditLog !== null) {
      this.auditLog = null;
      return;
    }
    if (!this.intakeId) return;
    this.auditLoading = true;
    this.clientIntakeService.getAuditLog(this.intakeId).subscribe({
      next: res => { this.auditLoading = false; this.auditLog = res.data || []; },
      error: () => { this.auditLoading = false; this.auditLog = []; },
    });
  }

  private onIntakeLoaded(intake: ClientIntake): void {
    this.intake = intake;
    this.clientId = intake.clientId;
    this.clientName = `${intake.clientFirstname ?? ''} ${intake.clientLastname ?? ''}`.trim() || intake.clientEmail;

    this.form.patchValue({
      medicalConditions: intake.medicalConditions,
      medications: intake.medications,
      injuriesOrLimitations: intake.injuriesOrLimitations,
      trainingHistory: intake.trainingHistory,
      emergencyContactName: intake.emergencyContactName,
      emergencyContactPhone: intake.emergencyContactPhone,
    });

    const questionValues: Record<string, boolean | null> = {};
    for (const q of this.questions) questionValues[q.key as string] = (intake as any)[q.key] ?? null;
    this.signForm.patchValue({ signedName: intake.signedName, ...questionValues });
  }

  /**
   * Distinguishes an access-denied response from any other failure so we can show
   * a dedicated state. Only used for loadClientIntakeFailure — "not found" there
   * unambiguously means the intake record being loaded doesn't exist.
   */
  private handleError(error: string): void {
    const msg = (error || '').toLowerCase();
    if (msg.includes('not authorized') || msg.includes('unauthorized')) {
      this.accessDenied = true;
    } else if (msg.includes('not found')) {
      this.notFound = true;
    } else {
      this.loadError = error || genericError;
    }
  }

  /**
   * For send/draft/sign failures. Deliberately does NOT switch to the notFound
   * state on a "not found" message — unlike a load failure, "not found" here
   * could mean something else entirely in the payload (e.g. "Client not found"),
   * and the user is actively filling out a visible form, not loading an existing
   * record — flipping to an empty "not found" state would hide their input behind
   * the wrong UI. Always surface it inline, above the submit button, instead.
   */
  private handleSaveError(error: string): void {
    const msg = (error || '').toLowerCase();
    if (msg.includes('not authorized') || msg.includes('unauthorized')) {
      this.accessDenied = true;
    } else {
      this.submitError = error || genericError;
    }
  }
}
