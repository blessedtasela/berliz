import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { CenterReviewFormComponent } from './center-review-form.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('CenterReviewFormComponent', () => {
  let component: CenterReviewFormComponent;
  let fixture: ComponentFixture<CenterReviewFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterReviewFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: new Subject() },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ]
    });
    fixture = TestBed.createComponent(CenterReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
