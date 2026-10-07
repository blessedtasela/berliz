import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerFeatureVideosComponent } from './my-trainer-feature-videos.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';

describe('MyTrainerFeatureVideosComponent', () => {
  let component: MyTrainerFeatureVideosComponent;
  let fixture: ComponentFixture<MyTrainerFeatureVideosComponent>;
  let trainerService: jasmine.SpyObj<TrainerService>;

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
    trainerService = TestBed.inject(TrainerService) as jasmine.SpyObj<TrainerService>;
    fixture = TestBed.createComponent(MyTrainerFeatureVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends the uploaded file under "video" -- the field the backend reads -- not "videoRequest"', () => {
    const uploaded = { strapiId: 9, name: 'intro.mp4', mimeType: 'video/mp4', videoUrl: '/uploads/intro.mp4', byteSize: 1000 } as any;
    component.slots[0] = { savedId: null, previewUrl: '', uploaded: true, video: uploaded, originalMotivation: '', touched: true } as any;
    component.featureVideosForm.get('motivation_0')?.setValue('x'.repeat(320));
    trainerService.addTrainerFeatureVideo.and.returnValue(of({ id: 5, message: 'saved' }) as any);

    component.saveSlot(0);

    expect(trainerService.addTrainerFeatureVideo).toHaveBeenCalledTimes(1);
    const payload = trainerService.addTrainerFeatureVideo.calls.mostRecent().args[0];
    expect(payload.video).toBe(uploaded);
    expect('videoRequest' in payload).toBeFalse();
    expect(payload.position).toBe(0);
  });
});
