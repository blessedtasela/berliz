import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerIntroductionComponent } from './my-trainer-introduction.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';

describe('MyTrainerIntroductionComponent', () => {
  let component: MyTrainerIntroductionComponent;
  let fixture: ComponentFixture<MyTrainerIntroductionComponent>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['updateTrainerIntroduction', 'addTrainerIntroduction']);
    const strapiServiceSpy = jasmine.createSpyObj('StrapiService', ['uploadToStrapi']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerIntroductionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: TrainerService, useValue: trainerServiceSpy },
        { provide: StrapiService, useValue: strapiServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTrainerIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('introduction length', () => {
    const control = () => component.updateTrainerIntroductionForm.get('introduction')!;

    it('saves a short introduction: there is no minimum length', () => {
      control().setValue('Certified coach helping beginners build strength.');
      expect(control().valid).toBeTrue();
    });

    it('still needs something written', () => {
      control().setValue('');
      expect(control().invalid).toBeTrue();
      expect(control().errors?.['required']).toBeTruthy();
    });

    it('still stops at 1,200 characters', () => {
      control().setValue('x'.repeat(1200));
      expect(control().valid).toBeTrue();
      control().setValue('x'.repeat(1201));
      expect(control().errors?.['maxlength']).toBeTruthy();
    });
  });
});
