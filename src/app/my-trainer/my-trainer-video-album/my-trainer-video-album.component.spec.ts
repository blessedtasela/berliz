import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerVideoAlbumComponent } from './my-trainer-video-album.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';

describe('MyTrainerVideoAlbumComponent', () => {
  let component: MyTrainerVideoAlbumComponent;
  let fixture: ComponentFixture<MyTrainerVideoAlbumComponent>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['updateTrainerVideosAlbum', 'addTrainerVideosAlbum']);
    const strapiServiceSpy = jasmine.createSpyObj('StrapiService', ['uploadToStrapi']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerVideoAlbumComponent],
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
    fixture = TestBed.createComponent(MyTrainerVideoAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('album size and the add-video tiles', () => {
    it('has no minimum, so removing clips below six can still be saved', () => {
      expect(component.MIN_VIDEOS).toBe(0);
      expect(component.MAX_VIDEOS).toBe(12);
    });

    it('is ready to save with no clips once the comment is valid', () => {
      component.updateTrainerVideoAlbumForm.get('comment')?.setValue('x'.repeat(900));
      expect(component.videoCount).toBe(0);
      expect(component.formReady).toBeTrue();
    });

    it('gives every empty tile a real, focusable file input inside its label', () => {
      fixture.detectChanges();
      const inputs = fixture.nativeElement.querySelectorAll('label [data-testid="album-file-input"]') as NodeListOf<HTMLInputElement>;
      expect(inputs.length).toBe(12);
      expect(inputs[0].type).toBe('file');
      expect(inputs[0].classList).toContain('sr-only');
      expect(inputs[0].classList).not.toContain('hidden');
      expect(inputs[3].getAttribute('aria-label')).toBe('Add video 4');
    });
  });
});
