import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterAlbumComponent } from './center-album.component';

describe('CenterAlbumComponent', () => {
  let component: CenterAlbumComponent;
  let fixture: ComponentFixture<CenterAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterAlbumComponent]
    });
    fixture = TestBed.createComponent(CenterAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
