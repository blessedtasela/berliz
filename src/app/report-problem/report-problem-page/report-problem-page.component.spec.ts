import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

import { ReportProblemPageComponent } from './report-problem-page.component';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ReportProblemPageComponent', () => {
  let component: ReportProblemPageComponent;
  let fixture: ComponentFixture<ReportProblemPageComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const addUrl = environment.api + '/problemReport/add';

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    TestBed.configureTestingModule({
    declarations: [ReportProblemPageComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [ReactiveFormsModule,
        RouterTestingModule,
        NgxUiLoaderModule],
    providers: [
        provideMockStore({ initialState: {} }),
        NgxUiLoaderService,
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(ReportProblemPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not call the API and flags the form invalid when required fields are missing', () => {
    component.submitForm();

    expect(component.invalidForm).toBeTrue();
    expect(component.submitError).toContain('complete all required fields');
    httpMock.expectNone(addUrl);
  });

  it('submits successfully, captures the reference code and shows the success state', () => {
    component.reportForm.setValue({
      category: 'TECHNICAL',
      name: 'Jane Doe',
      email: 'jane@example.com',
      description: 'The booking calendar does not load on Safari.'
    });

    component.submitForm();

    const req = httpMock.expectOne(addUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.category).toBe('TECHNICAL');
    req.flush({ message: 'Your report has been submitted.', referenceCode: 'PR-000042' });

    expect(component.submitted).toBeTrue();
    expect(component.submitting).toBeFalse();
    expect(component.successMessage).toBe('Your report has been submitted.');
    expect(component.referenceCode).toBe('PR-000042');
  });

  it('submits with no category picked, same as leaving it to the classifier', () => {
    component.reportForm.setValue({
      category: '',
      name: 'Jane Doe',
      email: 'jane@example.com',
      description: 'The booking calendar does not load on Safari.'
    });

    component.submitForm();

    const req = httpMock.expectOne(addUrl);
    expect(req.request.body.category).toBe('');
    req.flush({ message: 'Your report has been submitted.', referenceCode: 'PR-000043' });

    expect(component.submitted).toBeTrue();
  });

  it('shows a real error message (not an alert) when the backend rejects the submission', () => {
    component.reportForm.setValue({
      category: 'PAYMENTS',
      name: 'Jane Doe',
      email: 'jane@example.com',
      description: 'I was charged twice for the same subscription.'
    });

    component.submitForm();

    const req = httpMock.expectOne(addUrl);
    req.flush({ message: 'Invalid data' }, { status: 400, statusText: 'Bad Request' });

    expect(component.submitted).toBeFalse();
    expect(component.submitting).toBeFalse();
    expect(component.submitError).toBe('Invalid data');
  });

  it('selectCategory sets and touches the category control', () => {
    component.selectCategory('SAFETY');

    expect(component.reportForm.get('category')?.value).toBe('SAFETY');
    expect(component.reportForm.get('category')?.touched).toBeTrue();
  });

  it('dismissSuccess clears the reference code along with the success state', () => {
    (component as any).submitted = true;
    (component as any).referenceCode = 'PR-000042';

    component.dismissSuccess();

    expect(component.submitted).toBeFalse();
    expect(component.referenceCode).toBeNull();
  });
});
