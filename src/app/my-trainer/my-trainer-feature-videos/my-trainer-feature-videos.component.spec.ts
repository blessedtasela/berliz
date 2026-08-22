import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerFeatureVideosComponent } from './my-trainer-feature-videos.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';

describe('MyTrainerFeatureVideosComponent', () => {
  let component: MyTrainerFeatureVideosComponent;
  let fixture: ComponentFixture<MyTrainerFeatureVideosComponent>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', [
      'updateTrainerFeatureVideo', 'addTrainerFeatureVideo', 'deleteTrainerFeatureVideo'
    ]);
    const strapiServiceSpy = jasmine.createSpyObj('StrapiService', ['uploadToStrapi']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerFeatureVideosComponent],
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
    fixture = TestBed.createComponent(MyTrainerFeatureVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
