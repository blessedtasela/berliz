import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TrainerVideoAlbumComponent } from './trainer-video-album.component';

describe('TrainerVideoAlbumComponent', () => {
  let component: TrainerVideoAlbumComponent;
  let fixture: ComponentFixture<TrainerVideoAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerVideoAlbumComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    });

    fixture = TestBed.createComponent(TrainerVideoAlbumComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
