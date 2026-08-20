import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { MyTrainerFeatureVideosComponent } from './my-trainer-feature-videos.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { TrainerFeatureVideo } from 'src/app/models/trainers.interface';

describe('MyTrainerFeatureVideosComponent', () => {
  let component: MyTrainerFeatureVideosComponent;
  let fixture: ComponentFixture<MyTrainerFeatureVideosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerFeatureVideosComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: NgxUiLoaderService, useValue: { start: () => {}, stop: () => {} } },
        { provide: SnackBarService, useValue: { openSnackBar: () => {} } },
        { provide: TrainerService, useValue: {} },
        { provide: StrapiService, useValue: {} },
        { provide: Store, useValue: { select: () => of(null), dispatch: () => {} } },
      ]
    });
    fixture = TestBed.createComponent(MyTrainerFeatureVideosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Regression test for: "Cannot read properties of undefined (reading 'date')"
  // at my-trainer-feature-videos.component.html:230. The template used to read
  // `trainerFeatureVideos[0].date` directly -- a brand new trainer with zero
  // feature videos yet (a normal, fully-loaded state, not a loading race) has
  // `trainerFeatureVideos: []`, so `[0]` was `undefined` and `.date` threw.
  // The fix routes the template through the `registeredDate` getter, which
  // already guarded on `?.length` but was never wired up to the template.
  it('renders safely with an empty feature-video list instead of throwing', () => {
    component.trainerFeatureVideos = [];

    expect(() => fixture.detectChanges()).not.toThrow();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No feature videos registered yet');
  });

  it('renders the registered date once feature videos have actually loaded', () => {
    const videos: TrainerFeatureVideo[] = [
      {
        id: 1,
        title: 'Intro',
        motivation: 'x'.repeat(300),
        thumbnailUrl: '',
        position: 0,
        featured: false,
        views: 0,
        likes: 0,
        status: 'true',
        date: '2026-01-15T00:00:00.000Z' as unknown as Date,
        lastUpdate: '2026-01-15T00:00:00.000Z' as unknown as Date,
        message: '',
        video: null as any,
        trainerId: 1,
        trainerName: 'Test Trainer',
      },
    ];

    component.trainerFeatureVideos = videos;

    expect(() => fixture.detectChanges()).not.toThrow();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Registered on');
    expect(compiled.textContent).not.toContain('No feature videos registered yet');
  });
});
