import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { NewsletterBulkMessageModalComponent } from './newsletter-bulk-message-modal.component';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('NewsletterBulkMessageModalComponent', () => {
  let component: NewsletterBulkMessageModalComponent;
  let fixture: ComponentFixture<NewsletterBulkMessageModalComponent>;

  beforeEach(() => {
    const newsletterServiceSpy = jasmine.createSpyObj('NewsletterService', ['sendBulkMessage']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [NewsletterBulkMessageModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
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
});
