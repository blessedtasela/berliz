import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Actions } from '@ngrx/effects';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { ClientIntakeFormComponent } from './client-intake-form.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import {
  selectClientIntakeLoading,
  selectSelectedClientIntake,
} from 'src/app/state/client-intake/client-intake.selectors';
import {
  createClientIntake,
  createClientIntakeFailure,
  createClientIntakeSuccess,
  loadClientIntakeFailure,
  updateClientIntake,
} from 'src/app/state/client-intake/client-intake.actions';

describe('ClientIntakeFormComponent', () => {
  let component: ClientIntakeFormComponent;
  let fixture: ComponentFixture<ClientIntakeFormComponent>;
  let store: MockStore;
  let actions$: Subject<any>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function setup(routeParams: Record<string, string> = { clientId: '10' }, queryParams: Record<string, string> = {}) {
    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    actions$ = new Subject();

    TestBed.configureTestingModule({
      declarations: [ClientIntakeFormComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectClientIntakeLoading, value: false },
            { selector: selectSelectedClientIntake, value: null },
          ]
        }),
        { provide: Actions, useValue: actions$ },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
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
    expect(store.dispatch).toHaveBeenCalledWith({ type: '[ClientIntake] Load By Id', id: 5 });
  });

  // ── DISCLOSURE BANNER — same non-dismissible pattern as terms-page ──
  it('renders a non-dismissible draft/legal-review disclosure banner', () => {
    setup();
    fixture.detectChanges();

    const banner = fixture.debugElement.query(By.css('[data-testid="legal-disclaimer-banner"]'));
    expect(banner).withContext('disclaimer banner should be present').toBeTruthy();

    const bannerText = ((banner.nativeElement as HTMLElement).textContent || '').replace(/\s+/g, ' ').trim();
    expect(bannerText.toLowerCase()).toContain('has not been reviewed by a licensed');
    expect(bannerText.toLowerCase()).toContain('legal review is required');

    const dismissControl = banner.query(By.css('button, [aria-label*="close" i], [aria-label*="dismiss" i]'));
    expect(dismissControl).withContext('banner must not have a close/dismiss control').toBeFalsy();
  });

  // ── FORM VALIDATION ──
  it('does not dispatch a create action when the form is invalid (missing consent / emergency contact)', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    component.submit();

    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[ClientIntake] Create' }));
    expect(component.form.get('consentAcknowledged')!.touched).toBeTrue();
  });

  it('marks all fields as touched so validation errors surface after a failed submit attempt', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    component.submit();

    expect(component.form.get('emergencyContactName')!.touched).toBeTrue();
    expect(component.form.get('emergencyContactPhone')!.touched).toBeTrue();
  });

  // ── SUBMIT SUCCESS ──
  it('dispatches createClientIntake with the clientId attached when the form is valid', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    component.form.patchValue({
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '555-0100',
      consentAcknowledged: true,
    });

    component.submit();

    expect(store.dispatch).toHaveBeenCalledWith(createClientIntake({
      data: jasmine.objectContaining({ clientId: 10, emergencyContactName: 'Jane Doe' })
    }));
  });

  it('dispatches updateClientIntake with the intake id attached in edit mode', () => {
    setup({ id: '5' });
    fixture.detectChanges();

    component.form.patchValue({
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '555-0100',
      consentAcknowledged: true,
    });

    component.submit();

    expect(store.dispatch).toHaveBeenCalledWith(updateClientIntake({
      data: jasmine.objectContaining({ id: 5, emergencyContactName: 'Jane Doe' })
    }));
  });

  it('shows a success snackbar and navigates to the saved intake on createClientIntakeSuccess', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    actions$.next(createClientIntakeSuccess({
      response: { message: 'Client intake submitted successfully', data: { id: 42 } as any, success: true, statusCode: 200 }
    }));

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Client intake submitted successfully', '');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/client-intake', 42]);
  });

  // ── SUBMIT / LOAD ERROR HANDLING ──
  it('shows an error snackbar on a generic createClientIntakeFailure', () => {
    setup({ clientId: '10' });
    fixture.detectChanges();

    actions$.next(createClientIntakeFailure({ error: 'Client not found' }));

    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Client not found', 'error');
    expect(component.accessDenied).toBeFalse();
  });

  // ── ACCESS-DENIED HANDLING ──
  it('sets accessDenied and shows the denied state when loadClientIntakeFailure reports an authorization error', () => {
    setup({ id: '5' });
    fixture.detectChanges();

    actions$.next(loadClientIntakeFailure({ error: 'You are not authorized to make this request' }));
    fixture.detectChanges();

    expect(component.accessDenied).toBeTrue();
    expect(snackBarSpy.openSnackBar).not.toHaveBeenCalled();

    const denied = fixture.debugElement.query(By.css('[data-testid="access-denied"]'));
    expect(denied).withContext('access-denied panel should render').toBeTruthy();

    const form = fixture.debugElement.query(By.css('form'));
    expect(form).withContext('form should be hidden when access is denied').toBeFalsy();
  });

  it('sets notFound when loadClientIntakeFailure reports the intake does not exist', () => {
    setup({ id: '999' });
    fixture.detectChanges();

    actions$.next(loadClientIntakeFailure({ error: 'Client intake not found' }));
    fixture.detectChanges();

    expect(component.notFound).toBeTrue();
    const notFound = fixture.debugElement.query(By.css('[data-testid="intake-not-found"]'));
    expect(notFound).toBeTruthy();
  });
});
