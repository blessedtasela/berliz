import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterVideoGalleryComponent } from './center-video-gallery.component';

describe('CenterVideoGalleryComponent', () => {
  let component: CenterVideoGalleryComponent;
  let fixture: ComponentFixture<CenterVideoGalleryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterVideoGalleryComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterVideoGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
