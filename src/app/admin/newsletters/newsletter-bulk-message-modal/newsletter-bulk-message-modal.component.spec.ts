import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of, throwError } from 'rxjs';

import { NewsletterBulkMessageModalComponent } from './newsletter-bulk-message-modal.component';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { newsletterFeatureKey } from 'src/app/state/newsletter/newsletter.reducer';
import { initialNewsletterState } from 'src/app/state/newsletter/newsletter.state';

describe('NewsletterBulkMessageModalComponent', () => {
  let component: NewsletterBulkMessageModalComponent;
  let fixture: ComponentFixture<NewsletterBulkMessageModalComponent>;
  let newsletterServiceSpy: jasmine.SpyObj<NewsletterService>;
  let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;

  beforeEach(() => {
    newsletterServiceSpy = jasmine.createSpyObj('NewsletterService', ['sendBulkMessage']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [NewsletterBulkMessageModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        // Without a matching initialState, selectNewsletterMessages'
        // `s => s.newsletterMessages` throws against the default MockStore
        // state once something (afterAll teardown here) gives that a chance
        // to actually surface.
        provideMockStore({ initialState: { [newsletterFeatureKey]: initialNewsletterState } }),
        { provide: NewsletterService, useValue: newsletterServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    });
    fixture = TestBed.createComponent(NewsletterBulkMessageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows exactly one error snackbar when the form is invalid, and never calls the service', () => {
    component.newsletterBulkMessageForm.patchValue({ subject: '', body: '' });

    component.sendNewsletterMessage();

    expect(component.invalidForm).toBeTrue();
    expect(newsletterServiceSpy.sendBulkMessage).not.toHaveBeenCalled();
    expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledTimes(1);
    expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledWith('Invalid form', 'error');
  });

  it('shows exactly one success snackbar on a valid submit, never a trailing error one', () => {
    component.newsletterBulkMessageForm.patchValue({
      subject: 'A subject over 12 chars',
      body: 'A message body that is well over fifty characters long for validation.',
    });
    newsletterServiceSpy.sendBulkMessage.and.returnValue(of({ message: 'Sent to 42 subscribers' }));

    component.sendNewsletterMessage();

    expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledTimes(1);
    expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledWith('Sent to 42 subscribers', '');
  });

  it('shows exactly one error snackbar when the send fails', () => {
    component.newsletterBulkMessageForm.patchValue({
      subject: 'A subject over 12 chars',
      body: 'A message body that is well over fifty characters long for validation.',
    });
    newsletterServiceSpy.sendBulkMessage.and.returnValue(throwError(() => ({ error: { message: 'Mail server unreachable' } })));

    component.sendNewsletterMessage();

    expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledTimes(1);
    expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledWith('Mail server unreachable', 'error');
  });
});
