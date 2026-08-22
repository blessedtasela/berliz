import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CategoryDetailsModalComponent } from './category-details-modal.component';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';

describe('CategoryDetailsModalComponent', () => {
  let component: CategoryDetailsModalComponent;
  let fixture: ComponentFixture<CategoryDetailsModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [CategoryDetailsModalComponent],
      imports: [StrapiUrlPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { categoryData: { date: new Date().toISOString(), lastUpdate: new Date().toISOString() } } }
      ]
    });
    fixture = TestBed.createComponent(CategoryDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
