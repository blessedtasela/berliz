import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerSubModalComponent } from './my-trainer-sub-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';

describe('MyTrainerSubModalComponent', () => {
  let component: MyTrainerSubModalComponent;
  let fixture: ComponentFixture<MyTrainerSubModalComponent>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['addTrainerSubscription']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerSubModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: TrainerService, useValue: trainerServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTrainerSubModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
