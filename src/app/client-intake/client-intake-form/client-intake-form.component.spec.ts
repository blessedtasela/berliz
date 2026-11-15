import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Actions } from '@ngrx/effects';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of, throwError, Subject } from 'rxjs';

import { ClientIntakeFormComponent } from './client-intake-form.component';
import { AuthService } from 'src/app/services/auth.service';
import { ClientIntakeService } from 'src/app/services/client-intake.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ClientIntake } from 'src/app/models/client-intake.model';
import {
  selectClientIntakeLoading,
  selectSelectedClientIntake,
} from 'src/app/state/client-intake/client-intake.selectors';
import {
  sendClientIntake,
  sendClientIntakeFailure,
  sendClientIntakeSuccess,
  loadClientIntake,
  loadClientIntakeFailure,
  saveClientIntakeDraft,
  signClientIntake,
} from 'src/app/state/client-intake/client-intake.actions';

describe('ClientIntakeFormComponent', () => {
  let component: ClientIntakeFormComponent;
  let fixture: ComponentFixture<ClientIntakeFormComponent>;
  let store: MockStore;
  let actions$: Subject<any>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let intakeServiceSpy: jasmine.SpyObj<ClientIntakeService>;

  const CLIENT_ID = 10;
  const ADMIN_ID = 999;

  function intake(over: Partial<ClientIntake> = {}): ClientIntake {
    return {
      id: 5, clientId: CLIENT_ID, clientFirstname: 'Jane', clientLastname: 'Doe', clientEmail: 'jane@example.com',
      trainerId: 2, trainerName: 'Coach Amy', status: 'SENT',
      medicalConditions: '', medications: '', injuriesOrLimitations: '', trainingHistory: '',
      emergencyContactName: 'Bob', emergencyContactPhone: '555-0100',
      parqHeartConditionOrHighBp: null, parqChestPain: null, parqDizzinessOrConsciousnessLoss: null,
      parqChronicMedicalCondition: null, parqPrescribedMedicationForCondition: null,
      parqBoneJointOrSoftTissueProblem: null, parqMedicallySupervisedActivityOnly: null,
      requiresPhysicianClearance: null, signedName: null, signedAt: null,
      sentAt: new Date(), lastUpdate: new Date(),
      ...over,
    } as ClientIntake;
  }

  function setup(routeParams: Record<string, string> = { clientId: '10' }, queryParams: Record<string, string> = {},
    selectedIntake: ClientIntake | null = null, currentUserId = CLIENT_ID, isAdmin = false) {
    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId', 'isAdmin']);
    authSpy.getCurrentUserId.and.returnValue(currentUserId);
    authSpy.isAdmin.and.returnValue(isAdmin);
    intakeServiceSpy = jasmine.createSpyObj('ClientIntakeService', ['requestEdit', 'decideEditRequest', 'adminEditIntake', 'getAuditLog']);
    actions$ = new Subject();

    TestBed.configureTestingModule({
      declarations: [ClientIntakeFormComponent],
      imports: [ReactiveFormsModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectClientIntakeLoading, value: false },
            { selector: selectSelectedClientIntake, value: selectedIntake },
          ]
        }),
        { provide: Actions, useValue: actions$ },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ClientIntakeService, useValue: intakeServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeParams),
              queryParamMap: convertToParamMap(queryParams),
            }
          }
        },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(ClientIntakeFormComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    if (store) store.resetSelectors();
  });

  // ── CREATE MODE (trainer sending) ──

  it('should create in create mode with the clientId route param', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.mode).toBe('create');
    expect(component.clientId).toBe(10);
  });

  it('dispatches loadClientIntake in edit mode with the id route param', () => {
    setup({ id: '5' });
    fixture.detectChanges();

    expect(component.mode).toBe('edit');
    expect(component.intakeId).toBe(5);
    expect(store.dispatch).toHaveBeenCalledWith(loadClientIntake({ id: 5 }));
  });

  it('does not dispatch sendClientIntake when the form is invalid (missing emergency contact)', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    component.submit();

    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[ClientIntake] Send' }));
    expect(component.form.get('emergencyContactName')!.touched).toBeTrue();
  });

  it('dispatches sendClientIntake with the clientId attached when the form is valid', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    component.form.patchValue({ emergencyContactName: 'Jane Doe', emergencyContactPhone: '555-0100' });
    component.submit();

    expect(store.dispatch).toHaveBeenCalledWith(sendClientIntake({
      data: jasmine.objectContaining({ clientId: 10, emergencyContactName: 'Jane Doe' })
    }));
  });

  it('shows a success snackbar and navigates to the sent PAR-Q on sendClientIntakeSuccess', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    actions$.next(sendClientIntakeSuccess({
      response: { message: 'PAR-Q sent', data: { id: 42 } as any, success: true, statusCode: 200 }
    }));

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('PAR-Q sent', '');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/client-intake', 42], { replaceUrl: true });
  });

  it('shows an inline error (not a snackbar) on a generic sendClientIntakeFailure', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    actions$.next(sendClientIntakeFailure({ error: 'Client not found' }));

    expect(component.submitError).toBe('Client not found');
    expect(snackBarSpy.openSnackBar).not.toHaveBeenCalled();
    expect(component.accessDenied).toBeFalse();
  });

  // ── ACCESS-DENIED / NOT-FOUND ──

  it('sets accessDenied and shows the denied state when loadClientIntakeFailure reports an authorization error', () => {
    setup({ id: '5' });
    fixture.detectChanges();

    actions$.next(loadClientIntakeFailure({ error: 'You are not authorized to make this request' }));
    fixture.detectChanges();

    expect(component.accessDenied).toBeTrue();
    const denied = fixture.debugElement.query(By.css('[data-testid="access-denied"]'));
    expect(denied).withContext('access-denied panel should render').toBeTruthy();
  });

  it('sets notFound when loadClientIntakeFailure reports the record does not exist', () => {
    setup({ id: '999' });
    fixture.detectChanges();

    actions$.next(loadClientIntakeFailure({ error: 'Client intake not found' }));
    fixture.detectChanges();

    expect(component.notFound).toBeTrue();
    expect(fixture.debugElement.query(By.css('[data-testid="intake-not-found"]'))).toBeTruthy();
  });

  // ── STATUS-DRIVEN VIEW (BK-47) ──

  it('the client sees the signing form while SENT', () => {
    setup({ id: '5' }, {}, intake({ status: 'SENT' }), CLIENT_ID, false);
    fixture.detectChanges();

    expect(component.canSignNow).toBeTrue();
    expect(component.canSaveDraftNow).toBeFalse();
    expect(fixture.debugElement.query(By.css('[data-testid="sign-form"]'))).toBeTruthy();
  });

  it('the creating trainer sees a co-filling draft form, not the signature, while SENT', () => {
    setup({ id: '5' }, {}, intake({ status: 'SENT' }), 20 /* trainer's own user id */, false);
    fixture.detectChanges();

    expect(component.isSigner).toBeFalse();
    expect(component.canSaveDraftNow).toBeTrue();
    expect(fixture.debugElement.query(By.css('[data-testid="draft-form"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-testid="sign-form"]'))).toBeFalsy();
  });

  it('dispatches signClientIntake with every field once the client signs', () => {
    setup({ id: '5' }, {}, intake({ status: 'SENT' }), CLIENT_ID, false);
    fixture.detectChanges();

    component.signForm.patchValue({
      parqHeartConditionOrHighBp: false, parqChestPain: false, parqDizzinessOrConsciousnessLoss: false,
      parqChronicMedicalCondition: false, parqPrescribedMedicationForCondition: false,
      parqBoneJointOrSoftTissueProblem: false, parqMedicallySupervisedActivityOnly: false,
      signedName: 'Jane Doe', consentAcknowledged: true,
    });
    component.sign();

    expect(store.dispatch).toHaveBeenCalledWith(signClientIntake({
      data: jasmine.objectContaining({ id: 5, signedName: 'Jane Doe', consentAcknowledged: true })
    }));
  });

  it('refuses to sign without answering every PAR-Q question', () => {
    setup({ id: '5' }, {}, intake({ status: 'SENT' }), CLIENT_ID, false);
    fixture.detectChanges();

    component.signForm.patchValue({ signedName: 'Jane Doe', consentAcknowledged: true });
    component.sign();

    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[ClientIntake] Sign' }));
    expect(component.submitError).toBeTruthy();
  });

  it('dispatches saveClientIntakeDraft for the trainer co-filling', () => {
    setup({ id: '5' }, {}, intake({ status: 'SENT' }), 20, false);
    fixture.detectChanges();

    component.form.patchValue({ emergencyContactName: 'Bob', emergencyContactPhone: '555-0100' });
    component.saveDraft();

    expect(store.dispatch).toHaveBeenCalledWith(saveClientIntakeDraft({ data: jasmine.objectContaining({ id: 5 }) }));
  });

  it('shows the locked, read-only view once signed, with the signature line', () => {
    setup({ id: '5' }, {}, intake({ status: 'COMPLETED', signedName: 'Jane Doe', signedAt: new Date() }), CLIENT_ID, false);
    fixture.detectChanges();

    expect(component.isReadOnlyLocked).toBeTrue();
    const signatureLine = fixture.debugElement.query(By.css('[data-testid="signature-line"]'));
    expect(signatureLine.nativeElement.textContent).toContain('Jane Doe');
    expect(fixture.debugElement.query(By.css('[data-testid="sign-form"]'))).toBeFalsy();
  });

  it('lets the client request an edit once locked, but not before', () => {
    setup({ id: '5' }, {}, intake({ status: 'COMPLETED' }), CLIENT_ID, false);
    fixture.detectChanges();

    expect(component.canRequestEdit).toBeTrue();

    intakeServiceSpy.requestEdit.and.returnValue(of({ success: true, message: 'Edit request sent', statusCode: 200, data: intake({ status: 'EDIT_REQUESTED' }) }));
    component.openRequestEdit();
    component.requestEditReason = 'Phone number changed';
    component.submitRequestEdit();

    expect(intakeServiceSpy.requestEdit).toHaveBeenCalledWith(5, 'Phone number changed');
    expect(component.intake?.status).toBe('EDIT_REQUESTED');
  });

  it('requires a reason before sending the edit request', () => {
    setup({ id: '5' }, {}, intake({ status: 'COMPLETED' }), CLIENT_ID, false);
    fixture.detectChanges();

    component.openRequestEdit();
    component.requestEditReason = '   ';
    component.submitRequestEdit();

    expect(intakeServiceSpy.requestEdit).not.toHaveBeenCalled();
    expect(component.requestEditError).toBeTruthy();
  });

  // ── ADMIN ──

  it('an admin sees the decide-edit-request controls while EDIT_REQUESTED', () => {
    setup({ id: '5' }, {}, intake({ status: 'EDIT_REQUESTED' }), ADMIN_ID, true);
    fixture.detectChanges();

    expect(component.canDecideEditRequest).toBeTrue();
    expect(fixture.debugElement.query(By.css('[data-testid="decide-edit-request"]'))).toBeTruthy();
  });

  it('denying an edit request requires a note', () => {
    setup({ id: '5' }, {}, intake({ status: 'EDIT_REQUESTED' }), ADMIN_ID, true);
    fixture.detectChanges();

    component.decideEditRequest(false);

    expect(intakeServiceSpy.decideEditRequest).not.toHaveBeenCalled();
    expect(component.decideError).toBeTruthy();
  });

  it('approving an edit request calls the service and refreshes the record', () => {
    setup({ id: '5' }, {}, intake({ status: 'EDIT_REQUESTED' }), ADMIN_ID, true);
    fixture.detectChanges();

    intakeServiceSpy.decideEditRequest.and.returnValue(of({ success: true, message: 'Edit window granted.', statusCode: 200, data: intake({ status: 'EDIT_GRANTED' }) }));
    component.decideEditRequest(true);

    expect(intakeServiceSpy.decideEditRequest).toHaveBeenCalledWith(5, { approve: true, note: undefined });
    expect(component.intake?.status).toBe('EDIT_GRANTED');
  });

  it('an admin can edit directly regardless of lock state, with a required reason', () => {
    setup({ id: '5' }, {}, intake({ status: 'COMPLETED' }), ADMIN_ID, true);
    fixture.detectChanges();

    component.openAdminEdit();
    component.adminForm.patchValue({ emergencyContactName: 'Bob', emergencyContactPhone: '555-0100' });
    expect(component.adminForm.get('reason')!.valid).toBeFalse();

    intakeServiceSpy.adminEditIntake.and.returnValue(of({ success: true, message: 'PAR-Q updated by admin.', statusCode: 200, data: intake({ status: 'COMPLETED' }) }));
    component.adminForm.patchValue({ reason: 'Client called in a correction' });
    component.submitAdminEdit();

    expect(intakeServiceSpy.adminEditIntake).toHaveBeenCalledWith(5, jasmine.objectContaining({ reason: 'Client called in a correction' }));
  });

  it('loads and shows the audit log on toggle', () => {
    setup({ id: '5' }, {}, intake({ status: 'COMPLETED' }), ADMIN_ID, true);
    fixture.detectChanges();

    intakeServiceSpy.getAuditLog.and.returnValue(of({
      success: true, message: '', statusCode: 200,
      data: [{ id: 1, action: 'SIGNED', actorName: 'Jane Doe', date: new Date() } as any]
    }));
    component.toggleAuditLog();

    expect(component.auditLog?.length).toBe(1);
  });

  it('a non-admin never sees the admin-edit or audit-log controls', () => {
    setup({ id: '5' }, {}, intake({ status: 'COMPLETED' }), CLIENT_ID, false);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="toggle-admin-edit"]'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[data-testid="toggle-audit-log"]'))).toBeFalsy();
  });
});
