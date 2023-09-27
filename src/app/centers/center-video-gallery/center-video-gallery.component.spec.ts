import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterVideoGalleryComponent } from './center-video-gallery.component';

describe('CenterVideoGalleryComponent', () => {
  let component: CenterVideoGalleryComponent;
  let fixture: ComponentFixture<CenterVideoGalleryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterVideoGalleryComponent]
    });
    fixture = TestBed.createComponent(CenterVideoGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
