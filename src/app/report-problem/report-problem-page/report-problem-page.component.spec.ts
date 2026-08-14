import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

import { ReportProblemPageComponent } from './report-problem-page.component';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

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
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NgxUiLoaderModule
      ],
      providers: [
        provideMockStore({ initialState: {} }),
        NgxUiLoaderService,
        { provide: AuthService, useValue: authServiceSpy }
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

  it('submits successfully and shows the success state', () => {
    component.reportForm.setValue({
      category: 'bug',
      name: 'Jane Doe',
      email: 'jane@example.com',
      description: 'The booking calendar does not load on Safari.'
    });

    component.submitForm();

    const req = httpMock.expectOne(addUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.category).toBe('bug');
    req.flush({ message: 'Your report has been submitted.' });

    expect(component.submitted).toBeTrue();
    expect(component.submitting).toBeFalse();
    expect(component.successMessage).toBe('Your report has been submitted.');
  });

  it('shows a real error message (not an alert) when the backend rejects the submission', () => {
    component.reportForm.setValue({
      category: 'billing',
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
    component.selectCategory('safety-concern');

    expect(component.reportForm.get('category')?.value).toBe('safety-concern');
    expect(component.reportForm.get('category')?.touched).toBeTrue();
  });
});
