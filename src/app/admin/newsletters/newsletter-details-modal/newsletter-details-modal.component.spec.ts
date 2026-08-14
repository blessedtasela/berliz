import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NewsletterDetailsModalComponent } from './newsletter-details-modal.component';

describe('NewsletterDetailsModalComponent', () => {
  let component: NewsletterDetailsModalComponent;
  let fixture: ComponentFixture<NewsletterDetailsModalComponent>;

  beforeEach(() => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockDialogData = {
      newsletterData: {
        id: 1,
        email: 'test@example.com',
        status: 'true',
        date: new Date(),
        lastUpdate: new Date(),
      }
    };

    TestBed.configureTestingModule({
      declarations: [NewsletterDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ]
    });

    fixture = TestBed.createComponent(NewsletterDetailsModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
