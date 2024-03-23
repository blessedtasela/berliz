import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerPhotoAlbumComponent } from './trainer-photo-album.component';

describe('TrainerPhotoAlbumComponent', () => {
  let component: TrainerPhotoAlbumComponent;
  let fixture: ComponentFixture<TrainerPhotoAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPhotoAlbumComponent]
    });
    fixture = TestBed.createComponent(TrainerPhotoAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
