import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { NewsletterPopupComponent } from './newsletter-popup.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NewsletterTriggerService } from './newsletter-trigger.service';

describe('NewsletterPopupComponent', () => {
  let component: NewsletterPopupComponent;
  let fixture: ComponentFixture<NewsletterPopupComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const triggerSpy = jasmine.createSpyObj('NewsletterTriggerService', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [NewsletterPopupComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: new Subject() },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: NewsletterTriggerService, useValue: triggerSpy },
        { provide: MAT_DIALOG_DATA, useValue: null }
      ]
    });
    fixture = TestBed.createComponent(NewsletterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
