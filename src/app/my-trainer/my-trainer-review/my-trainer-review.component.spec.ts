import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerReviewComponent } from './my-trainer-review.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';

describe('MyTrainerReviewComponent', () => {
  let component: MyTrainerReviewComponent;
  let fixture: ComponentFixture<MyTrainerReviewComponent>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['updateTrainerReviewStatus']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerReviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: TrainerService, useValue: trainerServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTrainerReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
