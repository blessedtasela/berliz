import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTrainerFeaturedPhotosComponent } from './my-trainer-featured-photos.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { TrainerFeaturedPhoto, TrainerPhotoAlbum } from 'src/app/models/trainers.interface';

function photo(id: number): PhotoResponse {
  return { id, strapiId: id, photoUrl: `/uploads/photo_${id}.jpg`, name: `p${id}`, mimeType: 'image/jpeg', byteSize: 1, ownerId: 1, mediaOwnerType: 'TRAINER' as any, date: new Date(), lastUpdate: new Date() };
}

function featured(id: number, position: number): TrainerFeaturedPhoto {
  return { id, photo: photo(id), position };
}

describe('MyTrainerFeaturedPhotosComponent', () => {
  let component: MyTrainerFeaturedPhotosComponent;
  let fixture: ComponentFixture<MyTrainerFeaturedPhotosComponent>;
  let trainerService: jasmine.SpyObj<TrainerService>;

  const album: TrainerPhotoAlbum = {
    id: 1, trainerId: 1, trainerName: 'T', comment: '', date: new Date(), lastUpdate: new Date(), message: '',
    photos: [photo(1), photo(2), photo(3), photo(4), photo(5)]
  };

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['updateMyFeaturedPhotos']);

    TestBed.configureTestingModule({
      declarations: [MyTrainerFeaturedPhotosComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: TrainerService, useValue: trainerServiceSpy }
      ]
    });

    trainerService = TestBed.inject(TrainerService) as jasmine.SpyObj<TrainerService>;
    fixture = TestBed.createComponent(MyTrainerFeaturedPhotosComponent);
    component = fixture.componentInstance;
    component.photoAlbum = album;
  });

  it('seeds the selection from the existing featured photos, sorted by position', () => {
    component.featuredPhotos = [featured(3, 1), featured(1, 0)];
    component.ngOnChanges({ featuredPhotos: {} as any });
    expect(component.selectedIds).toEqual([1, 3]);
    expect(component.hasChanges).toBeFalse();
  });

  it('toggling a new photo adds it to the selection and marks it changed', () => {
    component.featuredPhotos = [];
    component.ngOnChanges({ featuredPhotos: {} as any });
    component.toggle(2);
    expect(component.selectedIds).toEqual([2]);
    expect(component.hasChanges).toBeTrue();
  });

  it('toggling an already-selected photo removes it', () => {
    component.featuredPhotos = [featured(2, 0)];
    component.ngOnChanges({ featuredPhotos: {} as any });
    component.toggle(2);
    expect(component.selectedIds).toEqual([]);
    expect(component.hasChanges).toBeTrue();
  });

  it('refuses a 5th pick and surfaces an error instead', () => {
    component.featuredPhotos = [featured(1, 0), featured(2, 1), featured(3, 2), featured(4, 3)];
    component.ngOnChanges({ featuredPhotos: {} as any });
    component.toggle(5);
    expect(component.selectedIds.length).toBe(4);
    expect(component.submitError).toContain('up to 4');
  });

  it('save() pushes the current selection and resyncs from the response', () => {
    component.featuredPhotos = [];
    component.ngOnChanges({ featuredPhotos: {} as any });
    component.toggle(1);
    component.toggle(2);

    trainerService.updateMyFeaturedPhotos.and.returnValue(
      of({ success: true, statusCode: 200, message: 'Featured photos updated', data: [featured(1, 0), featured(2, 1)] })
    );

    component.save();

    expect(trainerService.updateMyFeaturedPhotos).toHaveBeenCalledWith([1, 2]);
    expect(component.hasChanges).toBeFalse();
    expect(component.saving).toBeFalse();
  });

  it('save() surfaces the backend error message on failure', () => {
    component.featuredPhotos = [];
    component.ngOnChanges({ featuredPhotos: {} as any });
    component.toggle(1);

    trainerService.updateMyFeaturedPhotos.and.returnValue(
      throwError(() => ({ error: { message: 'Not your photo' } }))
    );

    component.save();

    expect(component.submitError).toBe('Not your photo');
    expect(component.saving).toBeFalse();
  });
});
