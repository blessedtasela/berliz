import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterPhotoAlbumComponent } from './center-photo-album.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';
import { StrapiService } from 'src/app/services/strapi.service';

describe('CenterPhotoAlbumComponent', () => {
  let component: CenterPhotoAlbumComponent;
  let fixture: ComponentFixture<CenterPhotoAlbumComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockCenterService = jasmine.createSpyObj('CenterService', ['addPhotoAlbum', 'updatePhotoAlbum']);
    mockCenterService.addPhotoAlbum.and.returnValue(of({}));
    mockCenterService.updatePhotoAlbum.and.returnValue(of({}));
    const mockStrapiService = jasmine.createSpyObj('StrapiService', ['uploadToStrapi']);
    mockStrapiService.uploadToStrapi.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [CenterPhotoAlbumComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: mockNgxUiLoaderService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: CenterService, useValue: mockCenterService },
        { provide: StrapiService, useValue: mockStrapiService },
      ]
    });

    fixture = TestBed.createComponent(CenterPhotoAlbumComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
