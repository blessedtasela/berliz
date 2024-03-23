import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerVideoAlbumComponent } from './trainer-video-album.component';

describe('TrainerVideoAlbumComponent', () => {
  let component: TrainerVideoAlbumComponent;
  let fixture: ComponentFixture<TrainerVideoAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerVideoAlbumComponent]
    });
    fixture = TestBed.createComponent(TrainerVideoAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
